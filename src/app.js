/* eslint-disable no-console */
require('dotenv').config();
const config = require('config');
const Hapi = require('@hapi/hapi');
const { logger } = require('./utils/logger');
const authStrategies = require('./utils/authStrategy');
const registerPlugins = require('./utils/registerPlugins');
// const { subscriber } = require('./utils/queue/subscriber');
const registerBaseRoutes = require('./utils/registerBaseRoutes');

async function startServer({ services } = {}) {
  try {
    const server = new Hapi.Server(
      JSON.parse(JSON.stringify(config.server.connection)),
    );
    server.app.services = services;
    process.env.TZ = 'Africa/Lagos';
    await registerPlugins(server);
    authStrategies(server);
    registerBaseRoutes(server);
    await server.start();
    // subscriber(config.queue.coreQueue);
    logger.log({
      level: 'info',
      message: `%s %s started on port ${server.info.port}`,
    });
    return server;
  } catch (error) {
    console.log(error);
    logger.log({
      level: 'error',
      message: error,
    });
    return null;
  }
}

module.exports = { startServer };
