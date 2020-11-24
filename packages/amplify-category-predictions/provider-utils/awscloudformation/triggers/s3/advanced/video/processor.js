// You can also specify an optional input parameter, JobTag, that allows you to 
// identify the job in the completion status that's published to the Amazon SNS topic.
function createParams({externalAssetId, bucketName, decodeKey }) {
  return {
    CollectionId: process.env.collectionId,
    ExternalAssetId: externalAssetId,
    Video: {
      S3Object: {
        Bucket: bucketName,
        Name: decodeKey,
      },
    },
  };  
}
export function processVideoAsset(asset) {
  const { externalAssetId, bucketName, decodeKey } = asset
  const params1 = createParams({
    externalAssetId, bucketName, decodeKey
  })
  
  const result = await rekognition.indexFaces(params1).promise();
  
  if (result.FaceRecords) {
    console.log('Indexed video successfully');
  } else {
    console.log('Request Failed');
    console.log(result);
  }
} 

