console.log('Loading function');

const aws = require('aws-sdk');
const s3 = new aws.S3({apiVersion: '2006-03-01'});
const comprehend = new aws.Comprehend({apiVersion: '2017-11-27'});

const {unzipSync} = require('zlib');

const firstIndexOf = (c, ...vars) => Math.min(
        ...vars.map(v => c.indexOf(v)).filter(n => n > -1));
const lastIndexOf = (c, ...vars) => Math.max(
        ...vars.map(v => c.lastIndexOf(v)));

function deleteFolderAtBucket(bucket, prefix, callback) {
    s3.listObjects({
        Bucket: bucket,
        Prefix: prefix
    }, (err, data) => {
        if (err) {
            return callback(err);
        }

        if (data.Contents.length === 0) {
            callback(err, data);
        }

        const params = {
            Bucket: bucket,
            Delete: {Objects: []}
        };

        data.Contents.forEach(function (content) {
            params.Delete.Objects.push({Key: content.Key});
        });

        s3.deleteObjects(params, (err, data) => {
            if (err) {
                return callback(err);
            }
            callback(err, data);
        });
    });
}

const applicationJsonCharsetUtf8 = "application/json;charset=utf-8";

function getComprehendParams(msg, bucket, inputKey, randomBatchId,
        outputPrefix) {
    return {
        LanguageCode: msg.languages[0].LanguageCode,
        InputDataConfig: {
            S3Uri: `s3://${bucket}/${inputKey}`,
            InputFormat: 'ONE_DOC_PER_FILE'
        },
        OutputDataConfig: {
            S3Uri: `s3://${bucket}/output/${outputPrefix}/${randomBatchId}/`,
        },
        DataAccessRoleArn: process.env.ROLE_ARN,
        JobName: randomBatchId
    };
}

function deleteNoLongerNeededFiles(randomBatchId, bucket, comprehendOutputKey) {
    const deleteCallback = (err, data) => {
        if (err) {
            console.error('Error deleting folder', err)
        }
        console.log('Successfully deleted', data);
    };

    const languageInputPath = `input/language/${randomBatchId}`;
    deleteFolderAtBucket(bucket, languageInputPath, deleteCallback);

    const comprehendOutputPath = comprehendOutputKey.substring(0,
            comprehendOutputKey.indexOf(randomBatchId)
            + randomBatchId.length);
    deleteFolderAtBucket(bucket, comprehendOutputPath, deleteCallback);
}

function startNextComprehendAnalysis(msg, bucket, entitiesInputKey,
        randomBatchId) {
    const comprehendCallback = (err, data) => {
        if (err) {
            //TODO:
            console.error(err, err.stack);
        } else {
            console.log(data);
        }
    };

    comprehend.startEntitiesDetectionJob(
            getComprehendParams(
                    msg,
                    bucket,
                    entitiesInputKey,
                    randomBatchId,
                    `entities`),
            comprehendCallback);

    comprehend.startKeyPhrasesDetectionJob(
            getComprehendParams(
                    msg,
                    bucket,
                    entitiesInputKey,
                    randomBatchId,
                    `phrases`),
            comprehendCallback);

    comprehend.startSentimentDetectionJob(
            getComprehendParams(
                    msg,
                    bucket,
                    entitiesInputKey,
                    randomBatchId,
                    `sentiment`),
            comprehendCallback);
}

exports.handler = async (event, context) => {
    console.log('Received event:', JSON.stringify(event, null, 2));

    const bucket = event.Records[0].s3.bucket.name;
    const comprehendOutputKey = decodeURIComponent(
            event.Records[0].s3.object.key.replace(/\+/g, ' '));
    const comprehendOutputParams = {
        Bucket: bucket,
        Key: comprehendOutputKey,
    };
    try {
        const {Body} = await s3.getObject(comprehendOutputParams).promise();
        let jsonObject = unzipSync(Body)
        .toString('utf-8')
        .split('\0ustar')
        .slice(1)
        .map(c => JSON.parse(c.substring(firstIndexOf(c, '{', '['),
                lastIndexOf(c, '}', ']') + 1)));
        const language = jsonObject[0].Languages[0];

        const pathComponent = comprehendOutputKey.split('/');
        const randomBatchId = `${pathComponent[2]}`;

        const messageInputPath = `messages/${randomBatchId}`;
        const msgFilename = jsonObject[0].File.replace('.txt', '.json');
        const msgKey = `${messageInputPath}/${msgFilename}`;

        const msgAtS3 = await s3.getObject({
            Bucket: bucket,
            Key: msgKey,
            ResponseContentType: applicationJsonCharsetUtf8,
        }).promise();

        const msg = JSON.parse(msgAtS3.Body.toString());
        msg.languages = jsonObject[0].Languages;

        console.log('=====> check if message now has the languages inside: ',
                msg);

        const entitiesInputKey = `input/entities-and-phrases/${randomBatchId}/${msg.messageId}.txt`;
        await s3.putObject({
            Bucket: bucket,
            Key: entitiesInputKey,
            Body: Buffer.from(msg.body),
            ContentType: applicationJsonCharsetUtf8
        }).promise();

        await s3.putObject({
            Bucket: bucket,
            Key: msgKey,
            Body: Buffer.from(JSON.stringify(msg)),
            ContentType: applicationJsonCharsetUtf8
        }).promise();

        startNextComprehendAnalysis(msg, bucket, entitiesInputKey,
                randomBatchId);
        //TODO: put it on JIA internal QUEUE
        deleteNoLongerNeededFiles(randomBatchId, bucket,
                comprehendOutputKey);

        return language;
    } catch (err) {
        console.error(err);
        throw new Error(err);
    }
};
