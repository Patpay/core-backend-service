const usersController = require('./users.controller');
const bankAccountController = require('./bankAccount.controller');
const walletController = require('./wallet.controller');
const chargesController = require('./charges.controller');
const bankingController = require('./banking.controller');
const merchantController = require('./merchant.controller');
const adminController = require('./admin.controller');
const roleController = require('./roles.controller');
const transactionController = require('./transaction.controller');

module.exports = {
  usersController,
  bankAccountController,
  walletController,
  chargesController,
  bankingController,
  merchantController,
  adminController,
  roleController,
  transactionController,
};
