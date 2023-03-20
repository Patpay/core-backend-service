const config = require('config');
const rabbit = require('./initQueue');

module.exports = async (msg) => {
  const broker = await rabbit.getInstance();
  let queue;
  if (!msg.QueueType) {
    // eslint-disable-next-line no-param-reassign
    queue = config.queue.notificationQueue;
  } else {
    queue = config.queue.coreQueue;
  }
  broker.send(queue, msg);
};
