/* eslint-disable no-return-await */
const { error } = require('../utils/error');
const {
  verify, confirmAdmin, confirmUser,
} = require('../utils/tokenizer');

const getAll = async (request) => {
  if (await confirmAdmin(request)) {
    const result = await request.server.app.services.transactions.getAll(request.query);
    const response = {
      count: result.value ? result.value.length : 0,
      totalCounts: result.totalCounts,
      transactions: result.value,
    };
    return response;
  }
  return error(403, 'Unauthorized');
};

const getTransactions = async (request) => {
  let isAdmin = false;
  const { user } = await verify(request.auth.credentials.token);
  request.query.user = user;
  isAdmin = await confirmAdmin(request);
  if (!await confirmUser(request) && !isAdmin) {
    return error(403, 'Unauthorized');
  }
  const result = await request.server.app.services.transactions.getAll(request.query);
  return {
    count: result.value ? result.value.length : 0,
    totalCounts: result.totalCounts,
    transactions: result.value,
  };
};

const getById = async (request) => {
  const isAdmin = await confirmAdmin(request);
  if (!await confirmUser(request) && !isAdmin) {
    return error(403, 'Unauthorized');
  }
  const { user } = await verify(request.auth.credentials.token);
  const { id } = request.params;
  const value = await request.server.app.services.transactions.getById(id, user);
  if (value.error) {
    return error(404, value.error);
  }
  return value;
};

const transactionSummary = async (request) => {
  let isAdmin = false;
  const { startDate, endDate, dateField } = request.query;
  const { user } = await verify(request.auth.credentials.token);
  const payload = {
    startDate,
    endDate,
    dateField,
  };
  payload.user = user;

  isAdmin = await confirmAdmin(request);
  if (!await confirmUser(request) && !isAdmin) {
    return error(403, 'Unauthorized');
  }

  const result = await request.server.app.services.transactions
    .transactionSummary(payload, isAdmin);
  return result;
};

module.exports = {
  getTransactions,
  getAll,
  getById,
  transactionSummary,
};
