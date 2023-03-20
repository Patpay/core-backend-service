const mongoose = require('mongoose');
const { logger } = require('./logger');
require('dotenv').config();

const initDB = async () => {
  try {
    mongoose.set('strictQuery', false);
    const mongoDbUrl = process.env.DB_HOST;
    mongoose.connect(mongoDbUrl, { useNewUrlParser: true }).then(() => logger.log({
      level: 'info',
      message: 'connected to database....',
    }));
  } catch (error) {
    logger.log({
      level: 'error',
      message: error,
    });
  }
};

module.exports = {
  initDB,
};
