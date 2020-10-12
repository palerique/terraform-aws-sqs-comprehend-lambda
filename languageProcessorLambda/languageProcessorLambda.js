console.log('Loading function');

const aws = require('aws-sdk');
const s3 = new aws.S3({apiVersion: '2006-03-01'});

const {unzipSync} = require('zlib');

const firstIndexOf = (c, ...vars) => Math.min(
        ...vars.map(v => c.indexOf(v)).filter(n => n > -1));
const lastIndexOf = (c, ...vars) => Math.max(
        ...vars.map(v => c.lastIndexOf(v)));

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
        // console.log('===> jsonObject: ', jsonObject);
        // jsonObject[0].Languages.forEach(language => console.log(language))
        const language = jsonObject[0].Languages[0];
        console.log('probably this is the language: ', language);

        const pathComponent = comprehendOutputKey.split('/');
        //TODO: get original file to add language information:
        let languageInputBucket = 'terraform-aws-sqs-comprehend-lambda-s3-bucket';
        let randomBatchId = `${pathComponent[2]}`;
        const filename = jsonObject[0].File;
        let comprehendInputKey = `input/language/${randomBatchId}/${filename}`;
        const comprehendInputParams = {
            Bucket: languageInputBucket,
            Key: comprehendInputKey,
            ResponseContentType: 'application/json',
        };
        console.log('comprehendInputParams ===> ', comprehendInputParams);

        const comprehendInput = await s3.getObject(
                comprehendInputParams).promise();
        // console.log(comprehendInput.Body.toString()
        // .split('\0ustar')
        // .slice(1)
        // .map(c => JSON.parse(c.substring(firstIndexOf(c, '{', '['),
        //         lastIndexOf(c, '}', ']') + 1))));

        //TODO: convert the string to an object
        console.log(comprehendInput.Body.toString());

        return language;
    } catch (err) {
        console.log(err);
        const message = `Error getting object ${comprehendOutputKey} from bucket ${languageOutputBucket}. 
        Make sure they exist and your bucket is in the same region as this function.`;
        console.log(message);
        throw new Error(message);
    }
};
