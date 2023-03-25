module.exports = {
  swagger: {
    active: true,
    host: 'api.dev.patpay.com',
  },

  environment: process.env.ENVIRONMENT,
  server: {
    connection: {
      compression: false,
      port: process.env.PORT,
      routes: {
        cors: true,
      },
    },
  },
  jwtSecret: process.env.JWT_TOKEN,
  mongodb: {
    url: process.env.DB_HOST,
  },
  rabbitMQ: {
    host: process.env.RABBITMQ_HOST,
    queue: process.env.RABBITMQ_QUEUE,
  },
  sendgrid: {
    apiKey: process.env.SENDGRID_API_KEY,
    senderName: process.env.SENDGRID_SENDER_NAME || 'PATPAY',
  },
  mail: {
    from: process.env.EMAIL_FROM,
  },
  cors: { origin: ['*'] },
};
