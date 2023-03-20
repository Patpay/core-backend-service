const amqp = require('amqplib');
const _ = require('lodash');
const config = require('config');
const { logger } = require('../logger');

let instance;

class MessageBroker {
  constructor() {
    this.queues = {};
  }

  async init() {
    try {
      this.connection = await amqp.connect(config.rabbitMQ.url);
      this.channel = await this.connection.createChannel();
      return this;
    } catch (error) {
      logger.log({
        level: 'error',
        message: error.stack,
      });
      throw error;
    }
  }

  async send(queue, msg) {
    try {
      if (!this.connection) {
        await this.init();
      }
      await this.channel.assertQueue(queue, { durable: true });
      this.channel.sendToQueue(queue, Buffer.from(JSON.stringify(msg)));
    } catch (error) {
      logger.log({
        level: 'error',
        message: error.stack,
      });
      throw error;
    }
  }

  async subscribe(queue, handler) {
    try {
      if (!this.connection) {
        await this.init();
      }
      if (this.queues[queue]) {
        const existingHandler = _.find(this.queues[queue], (h) => h === handler);
        if (existingHandler) {
          return () => this.unsubscribe(queue, existingHandler);
        }
        this.queues[queue].push(handler);
        return () => this.unsubscribe(queue, handler);
      }

      if (!this.channel) {
        return () => this.unsubscribe(queue, handler);
      }

      await this.channel.assertQueue(queue, { durable: true });
      this.queues[queue] = [handler];
      this.channel.consume(
        queue,
        async (msg) => {
          const ack = _.once(() => this.channel.ack(msg));
          this.queues[queue].forEach((h) => h(msg, ack));
        },
      );
      return () => this.unsubscribe(queue, handler);
    } catch (error) {
      logger.log({
        level: 'error',
        message: error.stack,
      });
      throw error;
    }
  }

  async unsubscribe(queue, handler) {
    _.pull(this.queues[queue], handler);
  }
}

MessageBroker.getInstance = async () => {
  try {
    if (!instance) {
      const broker = new MessageBroker();
      instance = broker.init();
    }
    return instance;
  } catch (error) {
    logger.log({
      level: 'error',
      message: error,
    });
    return null;
  }
};

module.exports = MessageBroker;
