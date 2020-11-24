const AWS = require('aws-sdk'); //eslint-disable-line

// https://docs.aws.amazon.com/rekognition/latest/dg/API_DetectLabels.html
function createParams({ evRecord, externalAssetId, bucketName, decodeKey }) {
  return {
    ...evRecord || {},
    CollectionId: process.env.collectionId,
    ExternalImageId: externalAssetId,
    Image: {
      S3Object: {
        Bucket: bucketName,
        Name: decodeKey,
      },
    },
  };  
}

function processImageAsset(asset) {
  const { functionName, externalAssetId, bucketName, decodeKey } = asset
  const params1 = createParams({
    externalAssetId, bucketName, decodeKey
  })
  
  const rekognition = new AWS.Rekognition();
  const result = await rekognition[functionName](params1).promise();
  processResult(result, functionName)  
}

const processResultMap = {
  indexFaces: function (result) { return result.FaceRecords }
}

function processResult(result, functionName) {
  if (processResultMap[functionName](result)) {
    console.log('Indexed image successfully');
  } else {
    console.log('Request Failed');
    console.log(result);
  }
}

module.exports = {
  processResult,
  processImageAsset,
  createParams
}
