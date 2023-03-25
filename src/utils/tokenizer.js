/* eslint-disable consistent-return */
/* eslint-disable no-return-await */
const jwt = require('jsonwebtoken');
const config = require('config');
const { logger } = require('./logger');

module.exports = {
  async sign(data) {
    try {
      return await jwt.sign(data, config.jwtSecret, { expiresIn: '1h' });
    } catch (error) {
      logger.log({
        level: 'error',
        message: error,
      });
    }
  },
  async verify(token) {
    try {
      return await jwt.verify(token, config.jwtSecret);
    } catch (error) {
      logger.log({
        level: 'error',
        message: error,
      });
    }
  },
};
