const AWS = require('aws-sdk'); //eslint-disable-line
const { createAddToObj } = require('../utils');

// You can also specify an optional input parameter, JobTag, that allows you to 
// identify the job in the completion status that's published to the Amazon SNS topic.
function createParams({
  evRecord,
  bucketName, 
  decodeKey 
}) {
   const params = {
    ...evRecord || {},
    CollectionId: process.env.collectionId,
    Video: {
      S3Object: {
        Bucket: bucketName,
        Name: decodeKey,
      },
    },
  };
  return params
}
function processVideoAsset(asset) {
  const { functionName } = asset
  const params1 = createParams(asset)
  const rekognition = new AWS.Rekognition();
  
  const result = await rekognition[functionName](params1).promise();
  processResult(result, functionName)  
} 

function hasJobId(result) { return result.JobId }

const processResultMap = {
  startLabelDetection: hasJobId,
  startFaceSearch: hasJobId,
}

function processResult(result, functionName) {
  if (processResultMap[functionName](result)) {
    console.log('Video processed successfully');
  } else {
    console.log('Request Failed');
    console.log(result);
  }
}

module.exports = {
  processResult,
  processVideoAsset,
  createParams
}
