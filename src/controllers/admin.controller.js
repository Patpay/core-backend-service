const config = require('config');
const { error } = require('../utils/error');
const constants = require('../utils/constants');
const { verify, confirmAdmin, confirmSuperAdmin } = require('../utils/tokenizer');

const createAdmin = async (request) => {
  if (await confirmSuperAdmin(request)) {
    const {
      email,
      firstname,
      lastname,
      password,
      mobile,
      role,
    } = request.payload;
    if (role === config.migrationIDs.ADMIN_ROLE_IDS[1]) {
      return error(400, 'unable to create Admin User');
    }
    const adminResponse = request.server.app.services.admins.signupAdmin({
      email,
      firstname,
      lastname,
      mobile,
      password,
      role,
    });
    if (adminResponse.error) {
      return error(400, adminResponse.error);
    }
    return adminResponse;
  }
  return error(403, 'Unauthorized');
};

const signInAdmin = async (request, reply) => {
  const response = await request.server.app.services.admins.signInAdmin(
    request.payload,
  );
  if (response.error) {
    if (response.error.activated === false) {
      return reply.response(response.error).code(403);
    }
    return error(401, response.error);
  }
  return response;
};

const validateForgottenPasswordAdmin = async (request) => {
  const { emailMobile, token } = request.params;
  const response = await request.server.app.services.admins.validateForgottenPasswordAdmin({
    emailMobile,
    token,
  });
  if (response.error) {
    return error(400, response.error);
  }
  return response;
};

const getAll = async (request) => {
  if (await confirmSuperAdmin(request)) {
    const { query } = request;
    const admins = await request.server.app.services.admins.getAll(query);
    return {
      count: admins.value ? admins.value.length : 0,
      admins: admins.value,
    };
  }
  return error(403, 'Unauthorized');
};

const getAdmin = async (request) => {
  const { id } = request.params;
  const { admin } = await verify(request.auth.credentials.token);
  if (await confirmAdmin(request) || id === admin) {
    const value = await request.server.app.services.admins.getAdminById(id);
    if (value.error) {
      return error(404, value.error);
    }
    return value;
  }
  return error(403, 'Unauthorized');
};

const forgetPassword = async (request) => {
  const response = await request.server.app.services.admins.forgotPasswordRequest(
    request.params,
  );
  if (response.error) {
    return error(400, response.error);
  }
  return response;
};

const resetPassword = async (request) => {
  const { admin } = await verify(request.auth.credentials.token);
  const response = await request.server.app.services.admins.resetPassword(
    request.payload,
    admin,
  );
  if (response.error) {
    return error(400, response.error);
  }
  return response;
};

const updateAdmin = async (request) => {
  const { payload } = request;
  if (Object.keys(payload).length === 0 && payload.constructor === Object) {
    return error(400, constants.EMPTY_PAYLOAD);
  }
  const { admin } = await verify(request.auth.credentials.token);
  const response = await request.server.app.services.admins.updateAdmin(
    payload,
    admin,
  );
  if (response.error) {
    return error(400, response.error);
  }
  return response;
};

const deleteAdmin = async (request) => {
  const { password } = request.payload;
  const { admin } = await verify(request.auth.credentials.token);
  const response = await request.server.app.services.admins.deleteAdmin(
    admin,
    password,
  );
  if (response.error) {
    return error(400, response.error);
  }
  return response;
};

const changePassword = async (request) => {
  const { password, newPassword } = request.payload;
  const { admin } = await verify(request.auth.credentials.token);
  const response = await request.server.app.services.admins.changePassword(
    admin,
    password,
    newPassword,
  );
  if (response.error) {
    return error(400, response.error);
  }
  return response;
};

module.exports = {
  createAdmin,
  signInAdmin,
  validateForgottenPasswordAdmin,
  getAll,
  changePassword,
  resetPassword,
  deleteAdmin,
  updateAdmin,
  getAdmin,
  forgetPassword,
};
