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

    //TODO schedule coherence job to detect language
    // // Read options from the event parameter.
    // console.log("Reading options from event:\n",
    //         util.inspect(event, {depth: 5}));
    // const srcBucket = s.bucket.name;
    // // Object key may have spaces or unicode non-ASCII characters.
    // const srcKey = decodeURIComponent(
    //         s.object.key.replace(/\+/g, " "));
    // const dstBucket = srcBucket + "-resized";
    // const dstKey = "resized-" + srcKey;
    //
    // // Download the image from the S3 source bucket.
    // // try {
    // //     const params = {
    // //         Bucket: srcBucket,
    // //         Key: srcKey
    // //     };
    // //     var origimage = await s3.getObject(params).promise();
    // //
    // // } catch (error) {
    // //     console.log(error);
    // //     return;
    // // }
    //
    // console.log('Successfully resized ' + srcBucket + '/' + srcKey +
    //         ' and uploaded to ' + dstBucket + '/' + dstKey);

    //TODO: reactivate the comprehend part!
    // const {body} = event.Records[0];

    // const params = {
    //     LanguageCode: 'en', /* required */
    //     Text: body /* required */
    // };

    // let callbackFunc = (err, data) => {
    //     if (err) {
    //         // an error occurred
    //         console.error(err, err.stack);
    //     } else {
    //         // successful response
    //         //TODO: send to elsewhere the result:
    //         console.log(data);
    //     }
    // };

    // comprehend.detectDominantLanguage({
    //     Text: body /* required */
    // }, callbackFunc);
    // comprehend.detectKeyPhrases(params, callbackFunc);
    // comprehend.detectEntities(params, callbackFunc);
    // // comprehend.detectPiiEntities(params, callbackFunc);
    // comprehend.detectSentiment(params, callbackFunc);
    // // comprehend.detectSyntax(params, callbackFunc);

    callback(null, 'Hello from Lambda');
};
