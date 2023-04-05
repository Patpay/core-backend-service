/* eslint-disable max-len */
const { error } = require('../utils/error');
const { verify } = require('../utils/tokenizer');

const signUpUser = async (request) => {
  const user = request.payload;
  const response = await request.server.app.services.users.signUpUser(
    user,
  );
  if (response.error) {
    return error(400, response.error);
  }
  return response;
};

const signInUser = async (request) => {
  const user = request.payload;
  const response = await request.server.app.services.users.signInUser(
    user,
  );
  if (response.error) {
    return error(400, response.error);
  }
  return response;
};

const activateUser = async (request) => {
  const { token, userId } = request.params;
  const response = await request.server.app.services.users.activateUser(userId, token);
  if (response.error) {
    return error(400, response.error);
  }
  return response;
};

const resendToken = async (request) => {
  const { userId } = request.params;
  const response = await request.server.app.services.users.resendToken(userId);
  if (response.error) {
    return error(400, response.error);
  }
  return response;
};

const forgotPasswordRequest = async (request) => {
  const { emailMobile } = request.params;
  const response = await request.server.app.services.users.forgotPasswordRequest({ emailMobile });
  if (response.error) {
    return error(400, response.error);
  }
  return response;
};

const resetPassword = async (request) => {
  const { newPassword, emailMobile, token } = request.payload;
  const response = await request.server.app.services.users.resetPassword(newPassword, emailMobile, token);
  if (response.error) {
    return error(400, response.error);
  }
  return response;
};

const changePassword = async (request) => {
  const { password, newPassword } = request.payload;
  const { user } = await verify(request.auth.credentials.token);
  const response = await request.server.app.services.users.changePassword(user, password, newPassword);
  if (response.error) {
    return error(400, response.error);
  }
  return response;
};

const updateUser = async (request) => {
  const { payload } = request;
  const { user } = await verify(request.auth.credentials.token);
  const response = await request.server.app.services.users.updateUser(payload, user);
  if (response.error) {
    return error(400, response.error);
  }
  return response;
};

const setPin = async (request) => {
  const { payload } = request;
  const { user } = await verify(request.auth.credentials.token);
  const response = await request.server.app.services.users.setPin(user, payload);
  if (response.error) {
    return error(400, response.error);
  }
  return response;
};

const generateBankAccount = async (request) => {
  const { user } = await verify(request.auth.credentials.token);
  const response = await request.server.app.services.users.generateBankAccount(user);
  if (response.error) {
    return error(400, response.error);
  }
  return response;
};

module.exports = {
  signUpUser,
  signInUser,
  activateUser,
  resendToken,
  forgotPasswordRequest,
  resetPassword,
  changePassword,
  updateUser,
  setPin,
  generateBankAccount,
};
