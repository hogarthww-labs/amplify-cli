const AWS = require('aws-sdk'); //eslint-disable-line

// You can also specify an optional input parameter, JobTag, that allows you to 
// identify the job in the completion status that's published to the Amazon SNS topic.
function createParams({
  faceMatchThreshold,
  clientRequestToken, 
  jobTag, 
  minConfidence, 
  notificationChannel, 
  bucketName, 
  decodeKey 
}) {
   const params = {
    CollectionId: process.env.collectionId,
    Video: {
      S3Object: {
        Bucket: bucketName,
        Name: decodeKey,
      },
    },
  }; 
  if (faceMatchThreshold) {
    params.FaceMatchThreshold = faceMatchThreshold
  }
  if (clientRequestToken) {
    params.ClientRequestToken = clientRequestToken
  }    
  if (jobTag) {
    params.JobTag = jobTag
  }  
  if (minConfidence) {
    params.MinConfidence = minConfidence
  }  
  if (notificationChannel) {
    params.NotificationChannel = notificationChannel
  }  
  return params
}
export function processVideoAsset(asset) {
  const { functionName } = asset
  const params1 = createParams(asset)
  const rekognition = new AWS.Rekognition();
  
  const result = await rekognition[functionName](params1).promise();
  processResult(result, functionName)  
} 

const processResultMap = {
  startLabelDetection: function (result) { return result.JobId },
}

export function processResult(result, functionName) {
  if (processResultMap[functionName](result)) {
    console.log('Indexed video successfully');
  } else {
    console.log('Request Failed');
    console.log(result);
  }
}
