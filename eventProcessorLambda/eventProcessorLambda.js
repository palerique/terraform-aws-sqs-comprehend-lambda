const AWS = require('aws-sdk');
const comprehend = new AWS.Comprehend({apiVersion: '2017-11-27'});
const uuidv4 = require('uuid/v4');
const s3 = new AWS.S3();

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
    let record = event.Records[0];
    record.randomBatchId = randomBatchId;

    const languageDetectionBucket = `/input/language/${randomBatchId}/${record.messageId}.json`;

    // Upload to the destination bucket
    try {
        const destParams = {
            Bucket: 'terraform-aws-sqs-comprehend-lambda-s3-bucket',
            Key: languageDetectionBucket,
            Body: Buffer.from(JSON.stringify(record)),
            ContentType: "application/json;charset=utf-8"
        };

        const putResult = await s3.putObject(destParams).promise();

        console.log(
                `Message successfully persisted on ${languageDetectionBucket}`,
                putResult)

    } catch (error) {
        console.log(error);
        return;
    }

    //TODO: reactivate the comprehend part!
    const {body} = event.Records[0];

    const params = {
        LanguageCode: 'en', /* required */
        Text: body /* required */
    };

    let callbackFunc = (err, data) => {
        if (err) {
            // an error occurred
            console.error(err, err.stack);
        } else {
            // successful response
            //TODO: send to elsewhere the result:
            console.log(data);
        }
    };

    comprehend.detectDominantLanguage({
        Text: body /* required */
    }, callbackFunc);
    comprehend.detectKeyPhrases(params, callbackFunc);
    comprehend.detectEntities(params, callbackFunc);
    // comprehend.detectPiiEntities(params, callbackFunc);
    comprehend.detectSentiment(params, callbackFunc);
    // comprehend.detectSyntax(params, callbackFunc);

    callback(null, 'Hello from Lambda');
};
