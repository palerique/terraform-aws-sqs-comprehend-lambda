const AWS = require('aws-sdk');
const comprehend = new AWS.Comprehend({apiVersion: '2017-11-27'});

exports.handler = (event, context, callback) => {

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
    // comprehend.detectEntities(params, callbackFunc);
    // comprehend.detectPiiEntities(params, callbackFunc);
    comprehend.detectSentiment(params, callbackFunc);
    // comprehend.detectSyntax(params, callbackFunc);

    callback(null, 'Hello from Lambda');
};
