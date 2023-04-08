// eslint-disable-next-line no-empty-pattern
const {
  userService,
  bankAccountService,
  walletService,
  bankingService,
  chargesService,
  transactionService,
  merchantService,
  adminService,
  roleService,
} = require('.');

const createServices = () => ({
  users: userService(),
  bankAccounts: bankAccountService(),
  wallets: walletService(),
  banking: bankingService(),
  charges: chargesService(),
  transactions: transactionService(),
  merchants: merchantService(),
  admins: adminService(),
  roles: roleService(),
});
module.exports = {
  createServices,
};
