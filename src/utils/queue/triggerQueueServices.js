/* eslint-disable global-require */
const constants = require('../constants');
const { logger } = require('../logger');

module.exports = async (payload) => {
  try {
    const {
      bankAccountService, bankingService,
    } = require('../../services');
    const services = {
      [constants.BULK_BANK_ACCOUNT_JOB]: bankAccountService().saveWithdrawalAccount,
      [constants.TRANSFER_JOB]: bankingService().processTransferJob,
      [constants.TRANSFER_BANA_JOB]: bankingService().sendMoneyToBanaAccountJob,

    };
    await services[payload.QueueType](payload);
  } catch (error) {
    logger.log({
      level: 'error',
      message: error,
    });
  }
};
