/* eslint-disable global-require */
/* eslint-disable no-unused-expressions */
/* eslint-disable max-len */
/* eslint-disable no-return-await */
/* eslint-disable consistent-return */
/* eslint-disable no-param-reassign */
/* eslint-disable no-underscore-dangle */
const { isValidObjectId } = require('mongoose');
const { v4: uuid } = require('uuid');
const { logger } = require('../utils/logger');
const constants = require('../utils/constants');
const { sendgridEmail } = require('../utils/notifications/sendGrid');
const { hashManager } = require('../utils/bcrypt');
const { sign } = require('../utils/tokenizer');

const {
  User,
} = require('../models/index');

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
      firstname: user.firstname,
      lastname: user.lastname,
    }),
  };
}
function reformatPhoneNumber(mobile) {
  // eslint-disable-next-line no-nested-ternary
  return mobile.charAt(0) === '2'
    ? `0${mobile.slice(3)}`
    : mobile.charAt(0) === '+'
      ? `0${mobile.slice(4)}`
      : mobile;
}
async function checkUserExist(user) {
  const userExist = await User.findOne({
    $or: [{ email: user.email }, { mobile: user.email }],
    activated: true,
    status: 'ACTIVE',
  });
  return userExist;
}

module.exports = {
  userService() {
    const {
      bankingService,
    } = require('.');
    return {
      async isUser(user) {
        if (!isValidObjectId(user)) return false;

        const admins = await User.findOne({ _id: user, status: 'ACTIVE' });
        return admins;
      },
      async signUpUser(user) {
        try {
          const validate = await User.findOne({
            $or: [{ email: user.email }, { mobile: user.email }],
          });
          if (!validate) {
            const token = Math.floor(Math.random() * 90000) + constants.TOKEN_RANGE;
            user.token = token;
            if (!user.password) user.password = user.email;
            user.password = await hashManager().hash(user.password);
            user.mobile = await reformatPhoneNumber(user.mobile)
            const newUser = await User.create(user);
            if (newUser.email) {
              sendgridEmail({
                data: { firstname: newUser.firstname, token: newUser.token },
                to: newUser.email,
                templateId: constants.ACTIVATION_SUCCESS_TEMPLATE_ID,
              });
            }
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
      async activateUser(userId, token) {
        try {
          if (!isValidObjectId(userId)) return { error: constants.NOT_FOUND };
          const updatedUser = await User.findOneAndUpdate(
            {
              _id: userId,
              token,
              activated: false,
            },
            {
              activated: true,
              status: 'ACTIVE',
            },
            {
              new: true,
            },
          );
          if (updatedUser) {
            const {
              email, firstname,
            } = updatedUser;
            sendgridEmail({
              data: { firstname },
              to: email,
              templateId: constants.ACTIVATION_SUCCESS_TEMPLATE_ID,
            });
            return (await getResponse(updatedUser));
          }
        } catch (err) {
          logger.log({
            level: 'error',
            message: err,
          });
          return { error: constants.GONE_BAD };
        }
      },
      async resendToken(userId) {
        try {
          if (!isValidObjectId(userId)) return { error: constants.NOT_FOUND };
          const token = Math.floor(Math.random() * 90000) + constants.TOKEN_RANGE;
          const updatedUser = await User.findOneAndUpdate(
            {
              _id: userId,
            },
            {
              token,
            },
            {
              new: true,
            },
          );
          if (updatedUser) {
            const { email, firstname } = updatedUser;
            sendgridEmail({
              data: { firstname, token },
              to: email,
              templateId: constants.SEND_TOKEN_TEMPLATE_ID,
            });
            return { msg: constants.TOKEN_SENT };
          }
          return { error: constants.INVALID_TOKEN };
        } catch (err) {
          logger.log({
            level: 'error',
            message: err,
          });
          return { error: constants.GONE_BAD };
        }
      },
      async validatePin(pin, userId) {
        const user = await User.findById(userId);
        if (!user.pin) {
          return { error: 'Please set your pin to use this feature' };
        }
        return await hashManager().compare(pin, user.pin);
      },
      async forgotPasswordRequest({ emailMobile }) {
        try {
          const emailMobileExist = await User.findOne({
            $or: [{ email: emailMobile }, { mobile: emailMobile }],
          });
          if (!emailMobileExist) {
            return { error: constants.INVALID_USER };
          }
          const token = Math.floor(Math.random() * 90000) + constants.TOKEN_RANGE;
          const updatedUser = await User.findOneAndUpdate(
            {
              email: emailMobileExist.email,
            },
            { token },
            {
              new: true,
            },
          );

          if (updatedUser) {
            const { email, firstname } = updatedUser;
            sendgridEmail({
              data: { firstname, token },
              to: email,
              templateId: constants.RESET_TOKEN_TEMPLATE_ID,
            });
            return { message: constants.TOKEN_SENT };
          }
          return { error: constants.NOT_FOUND };
        } catch (err) {
          logger.log({
            level: 'error',
            message: err,
          });
          return { error: constants.GONE_BAD };
        }
      },
      async resetPassword(newPassword, emailMobile, token) {
        try {
          const password = await hashManager().hash(newPassword);
          const user = await User.findOne({
            $or: [{ email: emailMobile }, { mobile: emailMobile }],
            token,
          });
          if (!user) {
            return { error: constants.INVALID_TOKEN };
          }
          const updatedUser = await User.findOneAndUpdate(
            {
              _id: user._id,
            },
            { password },
            {
              new: true,
            },
          );
          if (updatedUser) {
            const { email, firstname } = updatedUser;
            sendgridEmail({
              data: { firstname },
              to: email,
              templateId: constants.RESET_PASSWORD_SUCCESS_TEMPLATE_ID,
            });
            return await getResponse(user);
          }
          return { error: constants.GONE_BAD };
        } catch (error) {
          logger.log({
            level: 'error',
            message: error,
          });
          return { error: constants.GONE_BAD };
        }
      },
      async forgotPinRequest({ password, user }) {
        try {
          const userDetails = await User.findById(user);
          const validatePassword = await hashManager().compare(
            password,
            userDetails.password,
          );
          if (!validatePassword) {
            return { error: constants.INVALID_USER };
          }

          const token = Math.floor(Math.random() * 90000) + constants.TOKEN_RANGE;

          const updatedUser = await User.findOneAndUpdate(
            {
              _id: user,
            },
            { token },
            {
              new: true,
            },
          );

          if (updatedUser) {
            const { email, firstname } = updatedUser;
            sendgridEmail({
              data: { firstname, token },
              to: email,
              templateId: constants.RESET_TOKEN_TEMPLATE_ID,
            });
            return { message: constants.TOKEN_SENT };
          }
          return { error: constants.GONE_BAD };
        } catch (error) {
          logger.log({
            level: 'error',
            message: error,
          });
          return { error: constants.GONE_BAD };
        }
      },
      async changePassword(userId, password, newPassword) {
        try {
          if (!isValidObjectId(userId)) {
            return { error: constants.NOT_FOUND };
          }
          newPassword = await hashManager().hash(newPassword);
          const user = await User.findById(userId);
          const validatePassword = await hashManager().compare(
            password,
            user.password,
          );
          if (validatePassword) {
            const updatedUser = await User.findOneAndUpdate(
              {
                _id: userId,
              },
              { password: newPassword },
              {
                new: true,
              },
            );
            if (updatedUser) {
              const { email, firstname } = user;
              sendgridEmail({
                data: { firstname },
                to: email,
                templateId: constants.PASSWORD_CHANGE_SUCCESS_TEMPLATE_ID,
              });
              return { response: constants.SUCCESS };
            }
          }
          return { error: 'CURRENT PASSWORD NOT VALID' };
        } catch (error) {
          logger.log({
            level: 'error',
            message: error,
          });
          return { error: constants.GONE_BAD };
        }
      },
      async updateUser(user, userId) {
        try {
          if (!isValidObjectId(userId)) {
            return { error: constants.NOT_FOUND };
          }
          const updatedUser = await User.findByIdAndUpdate(userId, user, {
            new: true,
          });
          if (updatedUser) {
            return { message: constants.SUCCESS };
          }
          return { error: constants.INVALID_USER };
        } catch (error) {
          logger.log({
            level: 'error',
            message: error,
          });
          return { error: constants.GONE_BAD };
        }
      },
      async setPin(userId, payload) {
        try {
          if (!isValidObjectId(userId)) {
            return { error: constants.NOT_FOUND };
          }
          const user = await User.findById(userId);
          if (user.pin) {
            return { error: constants.PIN_EXIST };
          }
          const validatePassword = await hashManager().compare(
            payload.password,
            user.password,
          );

          if (validatePassword) {
            const pin = await hashManager().hash(payload.pin);
            await User.findOneAndUpdate(
              {
                _id: userId,
              },
              { pin },
              {
                new: true,
              },
            );
            return { response: constants.SUCCESS };
          }
          return { error: constants.GONE_BAD };
        } catch (error) {
          logger.log({
            level: 'error',
            message: error,
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
