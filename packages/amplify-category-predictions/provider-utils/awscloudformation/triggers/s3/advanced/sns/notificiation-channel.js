async function getNotificationChannel({evRecord, aws}) {
  let SNSTopicArn = evRecord.SNSTopicArn
  const RoleArn = evRecord.RoleArn

  if (SNSTopicArn) {
    return {
      SNSTopicArn,
      RoleArn      
    }
  } else {
    // TODO: extract into function
    let TopicName = asset.evRecord.TopicName || 'AI_Tags'
    SNSTopicArn = await getOrCreateTopicArnByName(TopicName, { evRecord, aws})
    return {
      SNSTopicArn,
      RoleArn
    }
  }
}

module.exports = {
  getNotificationChannel
}
