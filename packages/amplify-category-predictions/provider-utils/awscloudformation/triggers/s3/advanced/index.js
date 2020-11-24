const AWS = require('aws-sdk'); //eslint-disable-line
const querystring = require('querystring');
const { isVideo } = require('./utils');

exports.handler = async event => {
  AWS.config.update({
    region: event.Records[0].awsRegion,
  });

  const numberOfRecords = event.Records.length;
  console.log(numberOfRecords);  
  for (let j = 0; j < numberOfRecords; j++) {
    const evRecord = event.Records[j]
    const key = evRecord.s3.object.key;
    const decodeKey = Object.keys(querystring.parse(key))[0];
    const bucketName = evRecord.s3.bucket.name;
    const lastIndex = decodeKey.lastIndexOf('/');
    const extensionIndex = decodeKey.lastIndexOf('.');
    const extension = decodeKey.substring(extensionIndex + 1);
    const assetName = decodeKey.substring(lastIndex + 1);
    let functionName = evRecord.functionName
    const isVid = isVideo(extension)

    if (!functionName) {
      functionName = isVid ? 'startLabelDetection' : 'indexFaces'
    }

    let asset = {
      evRecord,
      'type': isVid ? 'video' : 'image',
      isVideo: isVid,
      isImage: !isVid,
      key,
      functionName,
      name: assetName,
      ext: extension,
      bucketName,
      decodeKey
    }

    if (isVid) {      
      // TODO: extract to function
      const SNSTopicArn = evRecord.SNSTopicArn
      const RoleArn = evRecord.RoleArn
      let NotificationChannel

      if (SNSTopicArn) {
        NotificationChannel = {
          SNSTopicArn
        }
      } else {
        // https://dev.to/singhs020/getting-started-with-aws-sns-44b0
        // https://gist.github.com/tmarshall/6149ed2475f964cda3f5
        // https://docs.aws.amazon.com/sdk-for-javascript/v2/developer-guide/sns-examples-managing-topics.html

        // List topics (maybe already present?)
        // Create promise and SNS service object
        var listTopicsPromise = new AWS.SNS({apiVersion: '2010-03-31'}).listTopics({}).promise();

        // Handle promise's fulfilled/rejected states
        listTopicsPromise.then(
          function(data) {
            // A list of topic ARNs.
            console.log(data.Topics);

            // use get topic attributes to get display name of each
            // https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/SNS.html#getTopicAttributes-property

          }).catch(
            function(err) {
            console.error(err, err.stack);
          });

        // TODO: extract into function
        let TopicName = asset.evRecord.TopicName || 'AI_Tags'

        // Create promise and SNS service object
        var createTopicPromise = new AWS.SNS({apiVersion: '2010-03-31'}).createTopic({Name: TopicName}).promise();

        // Handle promise's fulfilled/rejected states
        createTopicPromise.then(
          function(data) {
            // Fetch newly created Topic ARN
            console.log("Topic ARN is " + data.TopicArn);

            NotificationChannel = {
              SNSTopicArn
            }
    
          }).catch(
            function(err) {
            console.error(err, err.stack);
          });        
      }

      if (RoleArn) {
        NotificationChannel.RoleArn = RoleArn
      }   
      if (NotificationChannel) {
        asset.evRecord.NotificationChannel = NotificationChannel  
      }        
    }

    if (assetName === '') {
      console.log('creation of folder');
      return;
    }
    const externalAssetId = decodeKey.replace(/\//g, '::');
    asset.externalAssetId = externalAssetId
    console.log(decodeKey);
  
    if (event.Records[j].eventName === 'ObjectCreated:Put') {
      const processorFn = asset.isVideo ? processVideoAsset : processImageAsset
      processorFn(asset)
    } else {
      if (asset.isImage) {
        cleanupAsset(asset)
      }      
    }
  }
};
