const { error } = require('../utils/error');
const constants = require('../utils/constants');

const {
  verify, confirmUser, confirmAdmin
} = require('../utils/tokenizer');

const createWithdrawalAccount = async (request) => {
  if (!await confirmUser(request)) {
    return error(400, 'Unauthorized');
  }
  const { payload } = request;
  const { user } = await verify(request.auth.credentials.token);

  const response = await request.server.app.services.bankAccounts.saveWithdrawalAccount(
    payload,
    user,
  );
  if (response.error) {
    return error(400, response.error);
  }
  return response;
};

const getWithdrawalAcct = async (request) => {
  const { user } = await verify(request.auth.credentials.token);
  const response = await request.server.app.services.bankAccounts.getWithdrawalAcct(
    user,
  );
  if (response.error) {
    return error(400, response.error);
  }
  return response;
};

const getAll = async (request) => {
  if (!await confirmAdmin(request)) {
    return error(400, 'Unauthorized');
  }
  const {
    offset = 0,
    limit = 100,
    user,
    accountType,
    provider,
  } = request.query;
  const response = await request.server.app.services.bankAccounts.getAll({
    offset,
    limit,
    user,
    accountType,
    provider,
  });
  if (response.error) {
    return error(400, response.error);
  }
  return response;
};

const getById = async (request) => {
  const { id } = request.params;
  const response = await request.server.app.services.bankAccounts.getById(id);
  if (response.error) {
    return error(400, response.error);
  }
  return response;
};

const update = async (request) => {
  const { id } = request.params;
  const bankAccount = request.payload;
  if (
    Object.keys(bankAccount).length === 0
    && bankAccount.constructor === Object
  ) {
    return error(400, constants.EmptyPayload);
  }
  const response = await request.server.app.services.bankAccounts.update(
    id,
    bankAccount,
  );
  if (response.error) {
    return error(400, response.error);
  }
  return response;
};

module.exports = {
  getAll,
  getById,
  update,
  createWithdrawalAccount,
  getWithdrawalAcct,
};
