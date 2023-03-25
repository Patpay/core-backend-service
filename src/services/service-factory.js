// eslint-disable-next-line no-empty-pattern
const {
  userService,
} = require('.');

const createServices = () => ({
  users: userService(),
});
module.exports = {
  createServices,
};
