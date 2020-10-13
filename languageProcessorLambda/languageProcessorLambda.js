console.log('Loading function');

const aws = require('aws-sdk');
const s3 = new aws.S3({apiVersion: '2006-03-01'});

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
            callback();
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
            console.log('delete resulted in ', data);
            callback();
        });
    });
}

exports.handler = async (event, context) => {
    console.log('Received event:', JSON.stringify(event, null, 2));

    // Get the object from the event and show its content type
    const languageOutputBucket = event.Records[0].s3.bucket.name;
    const comprehendOutputKey = decodeURIComponent(
            event.Records[0].s3.object.key.replace(/\+/g, ' '));
    const comprehendOutputParams = {
        Bucket: languageOutputBucket,
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
        console.log('probably this is the language: ', language);

        const pathComponent = comprehendOutputKey.split('/');
        let languageInputBucket = 'terraform-aws-sqs-comprehend-lambda-s3-bucket';
        let randomBatchId = `${pathComponent[2]}`;
        const languageInputPath = `input/language/${randomBatchId}/`;
        const languageInputKey = `${languageInputPath}${(jsonObject[0].File)}`;
        const comprehendInput = await s3.getObject({
            Bucket: languageInputBucket,
            Key: languageInputKey,
            ResponseContentType: 'application/json',
        }).promise();

        const firstInputMessage = JSON.parse(comprehendInput.Body.toString());

        //TODO: add the language information to the first input
        firstInputMessage.language = jsonObject[0].Languages;
        console.log('|-=-=-=-=-=>>> firstInputMessage:', firstInputMessage);

        //TODO: save to the next input s3
        ///input/entities-and-phrases/${randomBatchId}/${messageId}.txt
        //TODO: start next comprehend analysis
        //TODO: put it on JIA internal QUEUE

        //TODO: delete no longer needed files:
        const deleteCallback = (err, data) => {
            if (err) {
                console.error('Error deleting folder', err)
                return;
            }
            console.log('Successfully deleted', data);
        };

        deleteFolderAtBucket(languageInputBucket, languageInputPath,
                deleteCallback);

        console.log('|***********>>> comprehendOutputKey', comprehendOutputKey)

        deleteFolderAtBucket(languageOutputBucket, comprehendOutputKey,
                deleteCallback);

        return language;
    } catch (err) {
        console.log(err);
        const message = `Error getting object ${comprehendOutputKey} from bucket ${languageOutputBucket}. 
        Make sure they exist and your bucket is in the same region as this function.`;
        console.log(message);
        throw new Error(message);
    }
};
