const { Consumer } = require('sqs-consumer')
const { createUserNotification } = require('./services/notification/admin/notification.service')
const { SQSClient } = require("@aws-sdk/client-sqs");

const sqsClient = new SQSClient({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  }
});

const QUEUE_URL = process.env.SQS_QUEUE_URL;
const app = Consumer.create({
  queueUrl: QUEUE_URL,
  handleMessage: async (message) =>
  {
    // try {
      const job = JSON.parse(message.Body)
      switch (job.type) {
        case 'register_user_notification':
          await createUserNotification(job.payload.notification_id)
          break
        case 'process_image':
          //console.log(`Processing image ${job.payload.image}...`)
          break
        default:
          //console.log('Unknown job type')
      }
    //console.log("processed")
    // } catch (error) {
    //   console.error(error)
    // }
  },
  sqs: sqsClient,
  //3 mins
  handleMessageTimeout: 180000,
})

app.on('error', (err) =>
{
  console.error(err.message)
})

app.on('processing_error', (err) =>
{
  console.error(err.message)
})

app.start()
