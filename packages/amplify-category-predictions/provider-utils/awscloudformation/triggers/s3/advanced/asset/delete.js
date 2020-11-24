async function deleteAssetIndex(rekognition, result, externalAssetID) {
  const len = result.Faces.length;
  let resultDeleted = false;
  for (let i = 0; i < len; i++) {
    if (result.Faces[i].ExternalAssetId === externalAssetID) {
      const params1 = {
        CollectionId: process.env.collectionId,
        FaceIds: [result.Faces[i].FaceId],
      };

      const result1 = await rekognition.deleteFaces(params1).promise();

      if (result1.DeletedFaces) {
        console.log('deleted faces from collection successfully');
      } else {
        console.log('error occurred');
        console.log(result1);
      }
      resultDeleted = true;
      break;
    }
  }

  return resultDeleted;
}

export function cleanupAsset(asset) {
  const { externalAssetId, decodeKey } = asset
  let params = {
    CollectionId: process.env.collectionId,
    MaxResults: 1000,
  };
  
  let result = await rekognition.listFaces(params).promise();
  let resultDeleted = await deleteAssetIndex(rekognition, result, externalAssetId);
  
  while (!resultDeleted && result.NextToken) {
    params = {
      CollectionId: process.env.collectionId,
      MaxResults: 1000,
      NextToken: result.NextToken,
    };
    result = await rekognition.listFaces(params).promise();
    resultDeleted = await deleteAssetIndex(rekognition, result, externalAssetId);
  }
  
  if (!resultDeleted) {
    console.log(`Unable to find the index to delete for ${decodeKey}`);
  }  
}

module.exports = {
  deleteAssetIndex 
}
