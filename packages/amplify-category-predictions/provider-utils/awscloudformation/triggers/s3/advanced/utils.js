function createAddToObj(obj) {
  return (record, names) => {
    names.map(name => {
      if (record[name]) {
        obj[name] = record[name]
      }
    })
    return obj
  }
} 

const videoExtensions = [
  'mp4',
  '3gp',
  'ogg',
  'wmv',
  'webm',
  'flv',
  'avi',
  'mov'
]

function isVideo(extension) {
  if (videoExtensions.includes(extension)) return true
  return false
}

module.exports = {
  isVideo,
  createAddToObj 
}
