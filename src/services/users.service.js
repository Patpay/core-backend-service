/* eslint-disable no-param-reassign */
/* eslint-disable no-underscore-dangle */
const { logger } = require('../utils/logger');
const { User } = require('../models/user');
const constants = require('../utils/constants');
const { hashManager } = require('../utils/bcrypt');
const { sign } = require('../utils/tokenizer');

async function getResponse(user) {
  user = user.toObject();
  const option = {};
  delete user.password;
  delete user.pin;
  delete user.token;

  return {
    user,
    token: await sign({
      user: user._id,
      ...option,
      email: user.email,
      fullName: user.fullName,
    }),
  };
}

async function checkUserExist(user) {
  const userExist = await User.findOne({
    $or: [{ email: user.email }, { mobile: user.email }],
  });
  return userExist;
}

module.exports = {
  userService() {
    return {
      async signUpUser(user) {
        try {
          const validate = await checkUserExist(user);
          if (!validate) {
            const token = Math.floor(Math.random() * 90000) + constants.TOKEN_RANGE;
            user.token = token;
            if (!user.password) user.password = user.email;
            user.password = await hashManager().hash(user.password);
            const newUser = await User.create(user);
            return {
              msg: constants.SUCCESS,
              userId: newUser._id,
            };
          }
          return { error: constants.DUPLICATE_USER };
        } catch (err) {
          logger.log({
            level: 'error',
            message: err,
          });
          return { error: constants.GONE_BAD };
        }
      },
      async signInUser(payload) {
        try {
          const dbUser = await checkUserExist(payload);
          if (!dbUser) return { error: constants.NOT_FOUND };
          const validatePassword = await hashManager().compare(payload.password, dbUser.password);
          if (!validatePassword) return { erro: constants.INVALID_USER };
          return (await getResponse(dbUser));
        } catch (err) {
          logger.log({
            level: 'error',
            message: err,
          });
          return { error: constants.GONE_BAD };
        }
      },
    };
  },
};
