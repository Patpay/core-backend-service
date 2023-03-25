const { error } = require('../utils/error');

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

module.exports = {
  signUpUser,
  signInUser,
};
