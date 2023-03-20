/* eslint-disable no-unused-vars */
const config = require('config');
const rabbit = require('./initQueue');
// const services = require('./triggerQueueServices');
const { logger } = require('../logger');

module.exports = async (queue) => {
  const broker = await rabbit.getInstance();
  broker.subscribe(queue, (msg, ack) => {
    try {
      if (queue === config.queue.coreQueue) {
        const payload = msg.content.toString();
        const objPayload = JSON.parse(JSON.parse(JSON.stringify(payload)));
        // services(objPayload);
        ack();
      }
    } catch (error) {
      logger.log({
        level: 'error',
        message: error,
      });
    }
  });
};
