const { SendMessageCommand, SQSClient } = require('@aws-sdk/client-sqs')
const QUEUE_URL = process.env.SQS_QUEUE_URL
const sqsClient = new SQSClient({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  }
})
const addJobToQueue = async (messageBody) =>
{
  const params = {
    QueueUrl: QUEUE_URL,
    MessageBody: JSON.stringify(messageBody)
  }

  try {
    const data = await sqsClient.send(new SendMessageCommand(params))
    //console.log('Message sent, ID:', data.MessageId)
  } catch (error)
  {
    console.error('Error sending message:', error)
  }
}

module.exports = {
  addJobToQueue
}
