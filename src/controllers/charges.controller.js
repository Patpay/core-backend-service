const { error } = require('../utils/error');

const create = async (request) => {
  const charge = request.payload;
  if (!charge.minRange || !charge.maxRange) {
    return error(400, 'Min Range and Max Range must both have a value');
  }
  if (charge.minRange && charge.maxRange) {
    if (charge.maxRange > charge.minRange) {
      charge.range = {
        min: charge.minRange,
        max: charge.maxRange,
      };
      delete charge.minRange;
      delete charge.maxRange;
    }
  }
  const response = await request.server.app.services.charges.create(charge);
  if (response.error) {
    return error(400, response.error);
  }
  return response;
};
const getAllCharges = async (request) => {
  const { offset, limit, status } = request.query;
  const result = await request.server.app.services.charges.getAllCharges({
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
const getAllInflowCharges = async (request) => {
  const { offset, limit, status } = request.query;
  const result = await request.server.app.services.charges.getAllInflowCharges({
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
const calculateCharge = async (request) => {
  const result = await request.server.app.services.charges.calculateCharge(request.query);
  if (result.error) {
    return error(400, result.error);
  }
  return result;
};
const deactivate = async (request) => {
  const { id } = request.params;
  const response = await request.server.app.services.charges.deactivate(id);
  if (response.error) {
    return error(400, response.error);
  }
  return response;
};

module.exports = {
  create,
  getAllCharges,
  calculateCharge,
  getAllInflowCharges,
  deactivate,
};
