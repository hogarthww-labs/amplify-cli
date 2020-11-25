function identifySNS(options) {
  return [
    {
      name: 'snsName',
      message: 'Please specify a the resource name for the SNS',
      validate: value => {
        const regex = new RegExp('^[a-zA-Z0-9]+$');
        return regex.test(value) ? true : 'SNS name should be alphanumeric!';
      },
    },
    {
      name: 'shouldDeduplicate',
      type: 'confirm',
      message: 'Should the SNS deduplicate messages',
      default: true,
    },
    {
      name: 'displayName',
      message: 'Please specify the SNS display name',
      validate: value => {
        const regex = new RegExp('^[a-zA-Z0-9]+$');
        return regex.test(value) ? true : 'Display name should be alphanumeric!';
      },
    },
    {
      name: 'isFifo',
      message: 'Should the SNS be a FIFO queue',
      type: 'confirm',
      default: false,
    },
    {
      name: 'tags',
      message: 'Please specify a comma separated list of tags',
      validate: value => {
        return value.trim() !== "" ? true : 'Tags should not be empty';
      },
    },
    {
      name: 'topicName',
      message: 'Please specify the name of the SNS message topic',
      validate: value => {
        const regex = new RegExp('^[a-zA-Z0-9]+$');
        return regex.test(value) ? true : 'Topic name should be alphanumeric!';
      },
    },
    {
      name: 'subscriptionProtocol',
      message: 'Please specify the subscription protocol to be used',
      type: 'list',
      choices: [
        'http',
        'https',
        'email',
        'email-json',
        'sms',
        'sqs',
        'application',
        'lambda'
      ]
    },
    {
      name: 'subscriptionEndpoint',
      message: 'Please specify the subscription endpoint to be used',
      validate: value => {
        return value.trim() !== "" ? true : 'Endpoint should not be empty';
      },
    },
  ]
}

module.exports = {
  identifySNS
}
