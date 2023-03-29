/* eslint-disable no-empty-pattern */
const {
  userApi,
} = require('../api');

// eslint-disable-next-line no-unused-vars
module.exports = (server) => {
  userApi(server, '/v1/users');
};
