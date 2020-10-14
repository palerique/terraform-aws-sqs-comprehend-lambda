console.log('Loading function');

// const aws = require('aws-sdk');
// const s3 = new aws.S3({apiVersion: '2006-03-01'});
// const comprehend = new aws.Comprehend({apiVersion: '2017-11-27'});
//
// const {unzipSync} = require('zlib');
//
// const firstIndexOf = (c, ...vars) => Math.min(
//         ...vars.map(v => c.indexOf(v)).filter(n => n > -1));
// const lastIndexOf = (c, ...vars) => Math.max(
//         ...vars.map(v => c.lastIndexOf(v)));
//
// function deleteFolderAtBucket(bucket, prefix, callback) {
//     s3.listObjects({
//         Bucket: bucket,
//         Prefix: prefix
//     }, (err, data) => {
//         if (err) {
//             return callback(err);
//         }
//
//         if (data.Contents.length === 0) {
//             callback(err, data);
//         }
//
//         const params = {
//             Bucket: bucket,
//             Delete: {Objects: []}
//         };
//
//         data.Contents.forEach(function (content) {
//             params.Delete.Objects.push({Key: content.Key});
//         });
//
//         s3.deleteObjects(params, (err, data) => {
//             if (err) {
//                 return callback(err);
//             }
//             callback(err, data);
//         });
//     });
// }
//
// const applicationJsonCharsetUtf8 = "application/json;charset=utf-8";
//
// function getComprehendParams(msg, bucket, inputKey, randomBatchId,
//         outputPrefix) {
//     return {
//         LanguageCode: msg.languages[0].LanguageCode,
//         InputDataConfig: {
//             S3Uri: `s3://${bucket}/${inputKey}`,
//             InputFormat: 'ONE_DOC_PER_FILE'
//         },
//         OutputDataConfig: {
//             S3Uri: `s3://${bucket}/output/${outputPrefix}/${randomBatchId}/`,
//         },
//         DataAccessRoleArn: process.env.ROLE_ARN,
//         JobName: randomBatchId
//     };
// }
//
// function deleteNoLongerNeededFiles(randomBatchId, bucket, comprehendOutputKey) {
//     const deleteCallback = (err, data) => {
//         if (err) {
//             console.error('Error deleting folder', err)
//         }
//         console.log('Successfully deleted', data);
//     };
//
//     const languageInputPath = `input/language/${randomBatchId}`;
//     deleteFolderAtBucket(bucket, languageInputPath, deleteCallback);
//
//     const comprehendOutputPath = comprehendOutputKey.substring(0,
//             comprehendOutputKey.indexOf(randomBatchId)
//             + randomBatchId.length);
//     deleteFolderAtBucket(bucket, comprehendOutputPath, deleteCallback);
// }
//
// function startNextComprehendAnalysis(msg, bucket, entitiesInputKey,
//         randomBatchId) {
//     const comprehendCallback = (err, data) => {
//         if (err) {
//             //TODO:
//             console.error(err, err.stack);
//         } else {
//             console.log(data);
//         }
//     };
//
//     comprehend.startEntitiesDetectionJob(
//             getComprehendParams(
//                     msg,
//                     bucket,
//                     entitiesInputKey,
//                     randomBatchId,
//                     `entities`),
//             comprehendCallback);
//
//     comprehend.startKeyPhrasesDetectionJob(
//             getComprehendParams(
//                     msg,
//                     bucket,
//                     entitiesInputKey,
//                     randomBatchId,
//                     `phrases`),
//             comprehendCallback);
//
//     comprehend.startSentimentDetectionJob(
//             getComprehendParams(
//                     msg,
//                     bucket,
//                     entitiesInputKey,
//                     randomBatchId,
//                     `sentiment`),
//             comprehendCallback);
// }

exports.handler = async (event, context) => {
    console.log('Received event:', JSON.stringify(event, null, 2));
    let msg = event.Records[0];
    console.log('message received from SQS: ', msg);
    return msg;
};
