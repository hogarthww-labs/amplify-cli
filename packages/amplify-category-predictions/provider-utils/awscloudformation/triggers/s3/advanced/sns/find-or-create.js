// https://dev.to/singhs020/getting-started-with-aws-sns-44b0
// https://gist.github.com/tmarshall/6149ed2475f964cda3f5
// https://docs.aws.amazon.com/sdk-for-javascript/v2/developer-guide/sns-examples-managing-topics.html

// List topics (maybe already present?)
// Create promise and SNS service object
async function listTopics(aws) {
  var listTopicsPromise = new AWS.SNS({apiVersion: '2010-03-31', ...aws}).listTopics({}).promise();

  // Handle promise's fulfilled/rejected states
  return listTopicsPromise.then(function(data) {
    // A list of topic ARNs.
    console.log(data.Topics);
    // use get topic attributes to get display name of each
    // https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/SNS.html#getTopicAttributes-property
    return data.Topics
  }).catch(function(err) {
    console.error(err, err.stack);
    return {error: err}
  });
}

async function createTopic(topicName, { sns, aws }) {
  // Create promise and SNS service object
  sns = snq || new AWS.SNS({apiVersion: '2010-03-31', ...aws})
  var createTopicPromise = sns.createTopic({Name: topicName}).promise();

  // Handle promise's fulfilled/rejected states
  createTopicPromise.then(function(data) {
    // Fetch newly created Topic ARN
    console.log("Topic ARN is " + data.TopicArn);
    return {
      SNSTopicArn: data.TopicArn
    }
  }).catch(function(err) {
    console.error(err, err.stack);
    return {error: err}
  }); 
}

async function findAsync(arr, asyncCallback) {
  const promises = arr.map(asyncCallback);
  const results = await Promise.all(promises);
  const index = results.findIndex(result => result);
  return arr[index];
}

async function getMatchingTopic({topicName, topicArns, sns}) {
  return await findAsync(topicArns, async function(TopicArn) {
    const attributes = await sns.getTopicAttributes({ TopicArn })
    return attributes.displayName === topicName
  })    
}

async function getOrCreateTopicArnByName(topicName, { evRecord, aws }) {
  const topicArns = await listTopics(aws)
  const TopicArn = await getMatchingTopic({topicName, topicArns})
  
  if (!TopicArn) {
    return await createTopic(topicName, { aws })
  } 
  return {
    TopicArn
  }
}

