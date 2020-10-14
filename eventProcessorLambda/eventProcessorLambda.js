const aws = require('aws-sdk');
const comprehend = new aws.Comprehend({apiVersion: '2017-11-27'});
const uuidv4 = require('uuid/v4');
const s3 = new aws.S3();

function getRandomBatchId() {
    let timestamp = new Date().toISOString()
    .replace(/T/, '')
    .replace(/Z/, '')
    .replace(/\./g, '')
    .replace(/:/g, '')
    .replace(/-/g, '');
    return `${timestamp}-${uuidv4()}`;
}

exports.handler = async (event, context, callback) => {
    const randomBatchId = getRandomBatchId();
    let msg = event.Records[0];
    msg.randomBatchId = randomBatchId;

    const bucket = process.env.BUCKET;
    let inputPath = `input/language/${randomBatchId}`;

    // Upload to the destination bucket
    try {
        const inputParams = {
            Bucket: bucket,
            Key: `${inputPath}/${msg.messageId}.txt`,
            Body: Buffer.from(msg.body)
        };

        const putResult = await s3.putObject(inputParams).promise();

        console.log(`Text successfully persisted 
        on ${inputPath}${msg.messageId}.txt`,
                putResult)

    } catch (error) {
        console.error(error);
        return;
    }

    //Upload to messages bkp
    let messagesPath = `messages/${randomBatchId}`;
    try {
        const msgBkpParams = {
            Bucket: bucket,
            Key: `${messagesPath}/${msg.messageId}.json`,
            Body: Buffer.from(JSON.stringify(msg)),
            ContentType: "application/json;charset=utf-8"
        };

        const putResult = await s3.putObject(msgBkpParams).promise();

        console.log(
                `Message successfully persisted on ${messagesPath}/${msg.messageId}.json`,
                putResult)

    } catch (error) {
        console.log(error);
        return;
    }

    let callbackFunc = (err, data) => {
        if (err) {
            // an error occurred
            //TODO: send message back to SQS
            console.error(err, err.stack);
        } else {
            // successful response
            //TODO: send to elsewhere the result:
            console.log(data);
        }
    };

    let dataAccessRoleArn = process.env.ROLE_ARN ? process.env.ROLE_ARN
            : 'arn:aws:iam::799098231639:role/terraform-20201009133944414300000001';

    let batchDetectLanguageParams = {
        InputDataConfig: {
            S3Uri: `s3://${bucket}/${inputPath}`,
            InputFormat: 'ONE_DOC_PER_FILE'
        },
        OutputDataConfig: {
            S3Uri: `s3://${bucket}/output/language/${randomBatchId}/`,
        },
        DataAccessRoleArn: dataAccessRoleArn,
        JobName: randomBatchId
    };
    comprehend.startDominantLanguageDetectionJob(batchDetectLanguageParams,
            callbackFunc)

    callback(null, 'Hello from Lambda');
};
