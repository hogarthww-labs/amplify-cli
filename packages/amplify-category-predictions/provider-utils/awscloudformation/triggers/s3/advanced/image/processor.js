// https://docs.aws.amazon.com/rekognition/latest/dg/API_DetectLabels.html
function createParams({externalAssetId, bucketName, decodeKey }) {
  return {
    CollectionId: process.env.collectionId,
    ExternalAssetId: externalAssetId,
    Image: {
      S3Object: {
        Bucket: bucketName,
        Name: decodeKey,
      },
    },
  };  
}

export function processImageAsset(asset) {
  const { externalAssetId, bucketName, decodeKey } = asset
  const params1 = createParams({
    externalAssetId, bucketName, decodeKey
  })
  
  const result = await rekognition.indexFaces(params1).promise();
  
  if (result.FaceRecords) {
    console.log('Indexed image successfully');
  } else {
    console.log('Request Failed');
    console.log(result);
  }
} 

