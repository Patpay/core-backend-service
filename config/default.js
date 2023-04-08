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
  paystack: {
    PAYSTACK_SECRET_KEY: process.env.PAYSTACK_SECRET_KEY,
    PAYSTACK_BASE_URL: process.env.PAYSTACK_BASE_URL,
    CONNECTION_TIMEOUT: process.env.CONNECTION_TIMEOUT,
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
  monnify: {
    MONNIFY_SECRET_KEY: process.env.MONNIFY_SECRET_KEY,
    MONNIFY_API_KEY: process.env.MONNIFY_API_KEY,
    MONNIFY_BASE_URL: process.env.MONNIFY_BASE_URL,
    MONNIFY_SOURCE_ACCOUNT_NUMBER: process.env.MONNIFY_SOURCE_ACCOUNT_NUMBER,
  },
  rabbitMQ: {
    host: process.env.RABBITMQ_HOST,
    queue: process.env.RABBITMQ_QUEUE,
    url: process.env.RABBIT_MQ_URL,
  },
  sendgrid: {
    apiKey: process.env.SENDGRID_API_KEY,
    senderName: process.env.SENDGRID_SENDER_NAME || 'PATPAY',
  },
  mail: {
    from: process.env.EMAIL_FROM,
  },
  migrationIDs: {
    BILL_EXPENSE_CATEGORY_ID: process.env.BILL_EXPENSE_CATEGORY_ID,
    STAMP_DUTY_EXPENSE_CATEGORY_ID: process.env.STAMP_DUTY_EXPENSE_CATEGORY_ID,
    TRANSFER_CHARGE_EXPENSE_CATEGORY_ID: process.env.TRANSFER_CHARGE_EXPENSE_CATEGORY_ID,
    ELECTRICITY_CHARGE_ID: process.env.ELECTRICITY_CHARGE_ID,
    AIRTIME_CHARGE_ID: process.env.AIRTIME_CHARGE_ID,
    DATA_CHARGE_ID: process.env.DATA_CHARGE_ID,
    WITHDRAWAL_EXPENSE_CATEGORY_ID: process.env.WITHDRAWAL_EXPENSE_CATEGORY_ID,
    TV_SUBSCRIPTION_CHARGE_ID: process.env.TV_SUBSCRIPTION_CHARGE_ID,
    ADMIN_ROLE_IDS: [
      process.env.ADMIN_ROLE_ID,
      process.env.SUPER_ADMIN_ROLE_ID,
    ],
  },
  kuda: {
    email: process.env.KUDA_EMAIL,
    apiKey: process.env.KUDA_TEST_API_KEY,
    password: process.env.KUDA_WEBHOOK_PASSWORD,
    loginURL: process.env.KUDA_LOGIN_URL,
    ACCOUNT_NUMBER: process.env.KUDA_ACCOUNT_NUMBER,
    accountCreationURL: process.env.KUDA_ACCOUNT_CREATION_URL,
  },
};
