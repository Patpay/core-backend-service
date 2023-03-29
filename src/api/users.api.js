const Joi = require('joi');
const namespace = require('hapijs-namespace');
const configs = require('config');
const { usersController } = require('../controllers');

function userResponse() {
  return {
    _id: Joi.string().required().example('5fb55fd471da0f122d564e7a'),
    email: Joi.string().required().example('t@w.v'),
    firstname: Joi.string().required().example('Samu'),
    lastname: Joi.string().required().example('Samu'),
    mobile: Joi.string().required().example('+23470050005005'),
    updatedAt: Joi.string().required().example('2020-11-18T17:54:28.209Z'),
    createdAt: Joi.string().required().example('2020-11-18T17:54:28.209Z'),
    status: Joi.string().example('Active'),
  };
}

const tokenResponse = (id) => ({
  'hapi-swagger': {
    id,
    responses: {
      200: {
        description: 'Should return status 200',
        schema: Joi.object({
          user: Joi.object(userResponse()),
          token: Joi.string()
            .required()
            .example('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9'),
        }).label('User'),
      },
    },
  },
});

module.exports = (server, prefix) => {
  namespace(server, prefix, [
    {
      method: 'POST',
      path: '/sign-up',
      config: {
        description: 'sign up',
        tags: ['api', 'user'],
        validate: {
          payload: Joi.object({
            email: Joi.string()
              .required()
              .email()
              .trim()
              .prefs({ convert: true }),
            password: Joi.string().required(),
            mobile: Joi.string().required(),
            firstname: Joi.string().required(),
            lastname: Joi.string().required(),
          }),
        },
        handler: usersController.signUpUser,
      },
    },
    {
      method: 'GET',
      path: '/user/activate/{userId}/{token}',
      config: {
        description: 'Activate Account',
        tags: ['api', 'user'],
        cors: configs.cors,
        validate: {
          params: Joi.object({
            userId: Joi.string().max(24).min(24).description('user id'),
            token: Joi.number().required().description('token'),
          }),
          failAction: async (request, h, err) => {
            throw err;
          },
        },
        handler: usersController.activateUser,
        plugins: tokenResponse('activate-account'),
      },
    },
    {
      method: 'GET',
      path: '/user/forget-password/{emailMobile}',
      config: {
        description: 'forgot-password',
        tags: ['api', 'user'],
        cors: configs.cors,
        validate: {
          params: Joi.object({
            emailMobile: Joi.string()
              .required()
              .trim()
              .lowercase()
              .example('123@gmail.com')
              .example('+2341234657553')
              .description('the email or mobile of the user'),
          }),
          failAction: async (request, h, err) => {
            throw err;
          },
        },
        handler: usersController.forgotPasswordRequest,
        plugins: {
          'hapi-swagger': {
            id: 'forgot-password-request',
            responses: {
              200: {
                description: 'Should return status 200',
                schema: Joi.object({
                  message: Joi.string().required().example('Email Sent'),
                }).label('User'),
              },
            },
          },
        },
      },
    },
    {
      method: 'POST',
      path: '/user/change-password',
      config: {
        description: 'change user password',
        tags: ['api', 'user'],
        cors: configs.cors,
        auth: 'simple',
        validate: {
          payload: Joi.object({
            newPassword: Joi.string()
              .required()
              .description('new user password'),
            password: Joi.string()
              .required()
              .description('new user password'),
          }),
          failAction: async (request, h, err) => {
            throw err;
          },
        },
        handler: usersController.changePassword,
        plugins: {
          'hapi-swagger': {
            id: 'change-user-password',
            responses: {
              200: {
                description: 'Should return status 200',
                schema: Joi.object({
                  message: Joi.string().required().example('Successful'),
                }).label('User'),
              },
            },
          },
        },
      },
    },
    {
      method: 'PATCH',
      path: '/user/update-user',
      config: {
        description: 'update use details',
        tags: ['api', 'user'],
        cors: configs.cors,
        auth: 'simple',
        validate: {
          payload: Joi.object({
            lastname: Joi.string()
              .description('new user password'),
            firstname: Joi.string()
              .description('new user password'),
            mobile: Joi.string()
              .description('new user password'),
          }),
          failAction: async (request, h, err) => {
            throw err;
          },
        },
        handler: usersController.updateUser,
        plugins: {
          'hapi-swagger': {
            id: 'update-user-details',
            responses: {
              200: {
                description: 'Should return status 200',
                schema: Joi.object({
                  message: Joi.string().required().example('Successful'),
                }).label('User'),
              },
            },
          },
        },
      },
    },
    {
      method: 'PATCH',
      path: '/user/set-pin',
      config: {
        description: 'Set user pin',
        tags: ['api', 'user'],
        cors: configs.cors,
        auth: 'simple',
        validate: {
          payload: Joi.object({
            password: Joi.string().required().description('user password'),
            pin: Joi.string().max(4).min(4).required()
              .description('user pin'),
          }),
          failAction: async (request, h, err) => {
            throw err;
          },
        },
        handler: usersController.setPin,
        plugins: {
          'hapi-swagger': {
            id: 'set-pin',
            responses: {
              200: {
                description: 'Should return status 200',
                schema: Joi.object({
                  message: Joi.string().required().example('Successful'),
                }).label('User'),
              },
            },
          },
        },
      },
    },
    {
      method: 'GET',
      path: '/user/resend/{userId}',
      config: {
        description: 'Resend Token',
        tags: ['api', 'user'],
        cors: configs.cors,
        validate: {
          params: Joi.object({
            userId: Joi.string().max(24).min(24).description('user id')
              .required(),
          }),
          failAction: async (request, h, err) => {
            throw err;
          },
        },
        handler: usersController.resendToken,
        plugins: {
          'hapi-swagger': {
            id: 'resend-token',
            responses: {
              200: {
                description: 'Should return status 200',
                schema: Joi.string().example('Token Sent'),
              },
            },
          },
        },
      },
    },
    {
      method: 'PATCH',
      path: '/user/reset-password',
      config: {
        description: 'reset password',
        tags: ['api', 'user'],
        validate: {
          payload: Joi.object({
            emailMobile: Joi.string()
              .required()
              .trim()
              .lowercase()
              .example('123@gmail.com')
              .example('+2341234657553')
              .required(),
            newPassword: Joi.string().required(),
            token: Joi.string().min(5).max(5).required()
              .description('the token being sent to the user'),
          }),
        },
        handler: usersController.resetPassword,
      },
    },

    {
      method: 'POST',
      path: '/login',
      config: {
        description: 'sign in user',
        tags: ['api', 'user'],
        validate: {
          payload: Joi.object({
            email: Joi.string()
              .required()
              .email()
              .trim()
              .prefs({ convert: true }),
            password: Joi.string().required(),
          }),
        },
        handler: usersController.signInUser,
      },
    },
  ]);
};
