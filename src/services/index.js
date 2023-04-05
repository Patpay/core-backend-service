const { userService } = require('./users.service');
const { bankAccountService } = require('./bankAccount.service');
const { walletService } = require('./wallet.service');
const { transactionService } = require('./transaction.service');
const { chargesService } = require('./charges.service');
const { bankingService } = require('./banking.service');

module.exports = {
  userService,
  bankAccountService,
  walletService,
  transactionService,
  chargesService,
  bankingService,
};
