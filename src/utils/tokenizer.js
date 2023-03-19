/* eslint-disable consistent-return */
/* eslint-disable no-return-await */
const jwt = require('jsonwebtoken');
const logger = require('./logger');
require('dotenv').config();

module.exports = {
  async sign(data) {
    return await jwt.sign(data, process.env.jwtSecret, { expiresIn: '1h' });
  },
  async verify(token) {
    try {
      return await jwt.verify(token, process.env.jwtSecret);
    } catch (error) {
      logger.log({
        level: 'error',
        message: error,
      });
    }
  },
};
