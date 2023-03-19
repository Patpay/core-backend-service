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
  mongodb: {
    url: process.env.DB_HOST,
  },
  cors: { origin: ['*'] },
};
