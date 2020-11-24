const querystring = require('querystring');

const videoExtensions = [
  'mp4',
  '3gp',
  'ogg',
  'wmv',
  'webm',
  'flv',
  'avi'
]

function isVideo(extension) {
  if (videoExtensions.includes(extension)) return true
  return false
}

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
      const jobTag = evRecord.jobTag
      const SNSTopicArn = evRecord.SNSTopicArn
      const RoleArn = evRecord.RoleArn
      let notificationChannel
      if (SNSTopicArn) {
        notificationChannel ={
          SNSTopicArn
        }
        if (RoleArn) {
          notificationChannel.RoleArn = RoleArn
        }             
      }

      asset = {
        ...asset,
        jobTag,
        minConfidence,
        clientRequestToken,
      }
      if (notificationChannel) {
        asset.notificationChannel = notificationChannel
      }
      if (functionName === 'startFaceSearch') {
        const faceMatchThreshold = evRecord.faceMatchThreshold        
        asset = {
          ...asset,
          faceMatchThreshold,
        }
      }
      if (functionName === 'startLabelDetection') {
        const minConfidence = evRecord.minConfidence
        const clientRequestToken = evRecord.clientRequestToken  

        asset = {
          ...asset,
          minConfidence,
          clientRequestToken,
        }  
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
      cleanupAsset(asset)
    }
  }
};
