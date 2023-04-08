/* eslint-disable no-empty-pattern */
const {
  userApi,
  bankAccountApi,
  chargesApi,
  walletApi,
  bankingApi,
  merchantApi,
  adminApi,
  roleApi
} = require('../api');

// eslint-disable-next-line no-unused-vars
module.exports = (server) => {
  userApi(server, '/v1/users');
  bankAccountApi(server, '/v1/bank-account');
  chargesApi(server, '/v1/charges');
  walletApi(server, '/v1/wallets');
  bankingApi(server, '/v1/banking');
  merchantApi(server, '/v1/merchants');
  adminApi(server, '/v1/admin');
  roleApi(server, '/v1/role');
};
