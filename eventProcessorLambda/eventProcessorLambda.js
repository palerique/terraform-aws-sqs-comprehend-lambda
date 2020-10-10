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

const bucket = 'terraform-aws-sqs-comprehend-lambda-s3-bucket';

exports.handler = async (event, context, callback) => {
    const randomBatchId = getRandomBatchId();
    let record = event.Records[0];
    record.randomBatchId = randomBatchId;

    let inputPath = `input/language/${randomBatchId}`;

    // Upload to the destination bucket
    try {
        const destParams = {
            Bucket: bucket,
            Key: `${inputPath}/${record.messageId}.json`,
            Body: Buffer.from(JSON.stringify(record)),
            ContentType: "application/json;charset=utf-8"
        };

        const putResult = await s3.putObject(destParams).promise();

        console.log(
                `Message successfully persisted on ${inputPath}${record.messageId}.json`,
                putResult)

    } catch (error) {
        console.log(error);
        return;
    }

    //TODO: reactivate the comprehend part!
    // const {body} = event.Records[0];
    //
    // const params = {
    //     LanguageCode: 'en', /* required */
    //     Text: body /* required */
    // };

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

    //TODO: # Instantiate Boto3 SDK:
    // client = boto3.client('comprehend', region_name='region')
    //
    // start_response = client.start_document_classification_job(
    //     InputDataConfig={
    //         'S3Uri': 's3://srikad-us-west-2-input/docclass/file name',
    //         'InputFormat': 'ONE_DOC_PER_LINE'
    //     },
    //     OutputDataConfig={
    //         'S3Uri': 's3://S3Bucket/output'
    //     },
    //     DataAccessRoleArn='arn:aws:iam::account number:role/resource name',
    //     DocumentClassifierArn=
    //     'arn:aws:comprehend:region:account number:document-classifier/SampleCodeClassifier1'
    // )
    //
    // print("Start response: %s\n", start_response)
    //
    // # Check the status of the job
    // describe_response = client.describe_document_classification_job(JobId=start_response['JobId'])
    // print("Describe response: %s\n", describe_response)
    //
    // # List all classification jobs in account
    // list_response = client.list_document_classification_jobs()
    // print("List response: %s\n", list_response)

    let dataAccessRoleArn = process.env.ROLE_ARN ? process.env.ROLE_ARN
            : 'arn:aws:iam::799098231639:role/terraform-20201009133944414300000001';

    console.log('Role ARN being used: ', dataAccessRoleArn);
    console.log('Role ARN on env var: ', process.env.ROLE_ARN);

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
