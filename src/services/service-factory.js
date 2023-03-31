// eslint-disable-next-line no-empty-pattern
const {
  userService,
  bankAccountService,
} = require('.');

const createServices = () => ({
  users: userService(),
  bankAccounts: bankAccountService(),
});
module.exports = {
  createServices,
};
