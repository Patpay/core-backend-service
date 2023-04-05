module.exports = {
  swagger: {
    active: true,
    host: 'api.dev.bana.com',
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
  cors: { origin: ['*'] },
  jwtSecret: process.env.JWT_TOKEN,
  mongodb: {
    url: process.env.DB_HOST,
  },
  queue: {
    coreQueue: process.env.CORE_QUEUE,
    notificationQueue: process.env.NOTIFICATION_QUEUE,
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
  Kuda: {
    email: process.env.KUDA_EMAIL,
    apiKey: process.env.KUDA_API_KEY,
    password: process.env.KUDA_WEBHOOK_PASSWORD,
    loginURL: process.env.KUDA_LOGIN_URL,
    ACCOUNT_NUMBER: process.env.KUDA_ACCOUNT_NUMBER,
    accountCreationURL: process.env.KUDA_ACCOUNT_CREATION_URL,
  },
};
