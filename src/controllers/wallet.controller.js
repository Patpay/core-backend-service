const config = require('config');
const { error } = require('../utils/error');

const {
  confirmAdmin,
  confirmUser,
  verify,
} = require('../utils/tokenizer');

const getAll = async (request) => {
  if (!await confirmAdmin(request)) {
    return error(400, 'Unauthorized');
  }
  const {
    offset, limit, status, user, type, balance,
  } = request.query;
  const result = request.server.app.services.wallets.getAll({
    offset,
    limit,
    status,
    user,
    type,
    balance,
  });
  if (result.error) {
    return error(400, result.error);
  }
  return result;
};

const getWallets = async (request) => {
  if (!await confirmAdmin(request)) {
    return error(400, 'Unauthorized');
  }
  const response = await request.server.app.services.wallets.getWallets();
  if (response.error) {
    return error(400, response.error);
  }
  return response;
};
const getWallet = async (request) => {
  if (!await confirmUser(request)) {
    return error(400, 'Unauthorized');
  }
  const { user } = await verify(request.auth.credentials.token);
  const payload = {};
  payload.user = user;

  const response = await request.server.app.services.wallets.getWallet(payload);
  if (response.error) {
    return error(400, response.error);
  }
  return response;
};


module.exports = {
  getAll,
  getWallets,
  getWallet,
};
