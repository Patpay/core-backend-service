/* eslint-disable no-console */
/* eslint-disable global-require */
const { logger } = require('./utils/logger');
const { startServer } = require('./app');
const { initDB } = require('./utils/database');

async function setup() {
  try {
    await initDB();
    const { createServices } = require('./services/service-factory');
    const services = createServices();
    process.env.TZ = 'Africa/Lagos';
    await startServer({
      services,
    });
  } catch (error) {
    console.log(error);
    logger.log({
      level: 'error',
      message: `Failed to start server::::::::${error}`,
    });
    process.exit(1);
  }
}
setup();
