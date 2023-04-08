const { userService } = require('./users.service');
const { bankAccountService } = require('./bankAccount.service');
const { walletService } = require('./wallet.service');
const { transactionService } = require('./transaction.service');
const { chargesService } = require('./charges.service');
const { bankingService } = require('./banking.service');
const { merchantService } = require('./merchant.service');
const { adminService } = require('./admin.service');
const { roleService } = require('./role.service')

module.exports = {
  userService,
  bankAccountService,
  walletService,
  transactionService,
  chargesService,
  bankingService,
  merchantService,
  adminService,
  roleService,
};
