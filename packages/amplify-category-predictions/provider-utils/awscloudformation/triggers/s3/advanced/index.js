const AWS = require('aws-sdk'); //eslint-disable-line
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
  const rekognition = new AWS.Rekognition();
  for (let j = 0; j < numberOfRecords; j++) {
    const key = event.Records[j].s3.object.key;
    const decodeKey = Object.keys(querystring.parse(key))[0];
    const bucketName = event.Records[j].s3.bucket.name;
    const lastIndex = decodeKey.lastIndexOf('/');
    const extensionIndex = decodeKey.lastIndexOf('.');
    const assetExtension = decodeKey.substring(extensionIndex + 1);
    const assetName = decodeKey.substring(lastIndex + 1);
    const asset = {
      key,
      name: assetName,
      ext: assetExtension,
      bucketName,
      decodeKey
    }
    if (assetName === '') {
      console.log('creation of folder');
      return;
    }
    const externalAssetId = decodeKey.replace(/\//g, '::');
    asset.externalAssetId = externalAssetId
    console.log(decodeKey);
  
    if (event.Records[j].eventName === 'ObjectCreated:Put') {
      const processorFn = isVideo(asset.ext) ? processVideoAsset : processImageAsset
      processorFn(asset)
    } else {
      cleanupAsset(asset)
    }
  }
};
