const authBearer = require('hapi-auth-bearer-token');
const authCookie = require('hapi-auth-cookie');
const bell = require('@hapi/bell');

module.exports = async (server) => {
  await server.register([
    bell,
    authBearer,
    authCookie,
  ]);
};
