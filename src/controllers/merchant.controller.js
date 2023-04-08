const { error } = require('../utils/error');
const { confirmAdmin } = require('../utils/tokenizer');

const create = async (request) => {
  if (!await confirmAdmin(request)) {
    return error(400, 'Unauthorized');
  }
  const charge = request.payload;
  const response = await request.server.app.services.merchants.create(charge);
  if (response.error) {
    return error(400, response.error);
  }
  return response;
};
const getAllMerchants = async (request) => {
  if (!await confirmAdmin(request)) {
    return error(400, 'Unauthorized');
  }
  const { offset, limit, status } = request.query;
  const result = await request.server.app.services.merchants.getAllMerchants({
    offset,
    limit,
    status,
  });
  const response = {
    count: result.value ? result.value.length : 0,
    totalCounts: result.totalCounts,
    charges: result.value,
  };
  return response;
};
const getById = async (request) => {
  if (!await confirmAdmin(request)) {
    return error(400, 'Unauthorized');
  }
  const { id } = request.params;
  const response = await request.server.app.services.merchants.getMerchant(id);
  if (response.error) {
    return error(400, response.error);
  }
  return response;
};
const deactivate = async (request) => {
  if (!await confirmAdmin(request)) {
    return error(400, 'Unauthorized');
  }
  const { id } = request.params;
  const response = await request.server.app.services.merchants.deactivate(id);
  if (response.error) {
    return error(400, response.error);
  }
  return response;
};

module.exports = {
  create,
  getAllMerchants,
  deactivate,
  getById,
};
