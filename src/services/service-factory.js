// eslint-disable-next-line no-empty-pattern
const {
  userService,
  bankAccountService,
  walletService,
} = require('.');

const createServices = () => ({
  users: userService(),
  bankAccounts: bankAccountService(),
  wallets: walletService(),
});
module.exports = {
  createServices,
};
