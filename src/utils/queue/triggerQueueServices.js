/* eslint-disable global-require */
const constants = require('../constants');
const { logger } = require('../logger');

module.exports = async (payload) => {
  try {
    const {
      bankAccountService,
    } = require('../../services');
    const services = {
      [constants.BULK_BANK_ACCOUNT_JOB]: bankAccountService().saveWithdrawalAccount,

    };
    await services[payload.QueueType](payload);
  } catch (error) {
    logger.log({
      level: 'error',
      message: error,
    });
  }
};
