const Joi = require('joi');
const namespace = require('hapijs-namespace');
const configs = require('config');

const { adminController } = require('../controllers');

function adminResponse() {
  return {
    _id: Joi.string().required().example('5fb55fd471da0f122d564e7a'),
    email: Joi.string().required().example('t@w.v'),
    lastname: Joi.string().required().example('Samu'),
    firstname: Joi.string().required().example('Alajo'),
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
          admin: Joi.object(adminResponse()),
          token: Joi.string()
            .required()
            .example('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9'),
        }).label('Admin'),
      },
    },
  },
});

module.exports = (server, prefix) => {
  namespace(server, prefix, [
    {
      method: 'POST',
      path: '/',
      config: {
        description: 'Create an admin',
        tags: ['api', 'admin'],
        auth: 'simple',
        cors: configs.cors,
        validate: {
          payload: Joi.object({
            email: Joi.string().email().required().description('admin email')
              .lowercase()
              .prefs({ convert: true }),
            firstname: Joi.string().required().description('admin first name'),
            lastname: Joi.string().required().description('admin last name'),
            password: Joi.string().required().description('admin password'),
            role: Joi.string().required().description('admin role'),
            mobile: Joi.string()
              .required()
              .example('+2347069671335'),
          }),
          failAction: async (request, h, err) => {
            throw err;
          },
        },
        handler: adminController.createAdmin,
        plugins: {
          'hapi-swagger': {
            id: 'create-admin',
            responses: {
              200: {
                description: 'Should return status 200',
                schema: Joi.object({
                  msg: Joi.string().example('Success'),
                  adminId: Joi.string()
                    .required()
                    .example('5fb55fd471da0f122d564e7a'),
                }),
              },
            },
          },
        },
      },
    },
    {
      method: 'GET',
      path: '/',
      config: {
        description: 'Get all admins',
        tags: ['api', 'admin'],
        handler: adminController.getAll,
        auth: 'simple',
        cors: configs.cors,
        validate: {
          query: Joi.object({
            limit: Joi.number()
              .description('max number of items to fetch'),
            offset: Joi.number()
              .description('number of items to skip'),
            status: Joi.boolean()
              .description('status of admin'),
            activated: Joi.boolean()
              .description('to check if the admin is activated by super admin'),
          }),
          failAction: async (request, h, err) => {
            throw err;
          },
        },
        plugins: {
          'hapi-swagger': {
            id: 'admin',
            responses: {
              200: {
                description: 'Should return status 200',
                schema: Joi.object({
                  totalCounts: Joi.number().required().example('15'),
                  count: Joi.number().required().example('15'),
                  admins: Joi.array().items(adminResponse()),
                }).label('customer'),
              },
            },
          },
        },
      },
    },
    {
      method: 'POST',
      path: '/login',
      config: {
        description:
            'Sign In admin with email or username or mobile and password',
        tags: ['api', 'admin'],
        cors: configs.cors,
        validate: {
          payload: Joi.object({
            adminEmailMobile: Joi.string()
              .required()
              .description('admin email or mobile').lowercase()
              .prefs({ convert: true }),
            password: Joi.string().required().description('admin password'),
          }),

          failAction: async (request, h, err) => {
            throw err;
          },
        },
        handler: adminController.signInAdmin,
        plugins: tokenResponse('customSignIn'),
      },
    },

    {
      method: 'GET',
      path: '/validate/{emailMobile}/{token}',
      config: {
        description: 'Validate token for forgot password',
        tags: ['api', 'admin'],
        cors: configs.cors,
        validate: {
          params: Joi.object({
            emailMobile: Joi.string()
              .required()
              .description('admin email or mobile number'),
            token: Joi.number().required().description('token'),
          }),
          failAction: async (request, h, err) => {
            throw err;
          },
        },
        handler: adminController.validateForgottenPasswordAdmin,
        plugins: tokenResponse('activate-forget-pasword-account'),
      },
    },
    {
      method: 'PATCH',
      path: '/',
      config: {
        description: 'Update an admin',
        tags: ['api', 'admin'],
        auth: 'simple',
        cors: configs.cors,
        payload: {
          output: 'stream',
          parse: true,
          allow: 'multipart/form-data',
          maxBytes: 2 * 1000 * 1000,
          multipart: true,
        },
        validate: {
          payload: Joi.object({
            photo: Joi.optional(),
            mobile: Joi.string()
              .optional()
              .example('+2347069671335'),
            whatsappNumber: Joi.string().optional().example('string'),
          }),
          failAction: async (request, h, err) => {
            throw err;
          },
        },
        handler: adminController.updateAdmin,
        plugins: {
          'hapi-swagger': {
            id: 'update-admin',
            responses: {
              200: {
                description: 'Should return status 200',
                schema: Joi.object(adminResponse()).label('Admin'),
              },
            },
          },
        },
      },
    },

    {
      method: 'POST',
      path: '/reset-password',
      config: {
        description: 'reset admin password',
        tags: ['api', 'admin'],
        cors: configs.cors,
        auth: 'simple',
        validate: {
          payload: Joi.object({
            newPassword: Joi.string()
              .required()
              .description('new admin password'),
          }),
          failAction: async (request, h, err) => {
            throw err;
          },
        },
        handler: adminController.resetPassword,
        plugins: {
          'hapi-swagger': {
            id: 'reset-admin-password',
            responses: {
              200: {
                description: 'Should return status 200',
                schema: Joi.object({
                  message: Joi.string().required().example('Successful'),
                }).label('Admin'),
              },
            },
          },
        },
      },
    },

    {
      method: 'DELETE',
      path: '/',
      config: {
        description: 'Delete admin',
        tags: ['api', 'admin'],
        auth: 'simple',
        cors: configs.cors,
        validate: {
          payload: Joi.object({
            password: Joi.string()
              .required()
              .description('the password of the admin to return'),
          }),
          failAction: async (request, h, err) => {
            throw err;
          },
        },
        handler: adminController.deleteAdmin,
        plugins: {
          'hapi-swagger': {
            id: 'delete-admin',
            responses: {
              200: {
                description: 'Should return status 200',
                schema: Joi.object({
                  response: Joi.string().required().example('successful'),
                }).label('Admin'),
              },
            },
          },
        },
      },
    },

    {
      method: 'PATCH',
      path: '/change-password',
      config: {
        description: 'Change admin password',
        tags: ['api', 'admin'],
        cors: configs.cors,
        auth: 'simple',
        validate: {
          payload: Joi.object({
            password: Joi.string().required().description('admin password'),
            newPassword: Joi.string()
              .required()
              .description('new admin password'),
          }),
          failAction: async (request, h, err) => {
            throw err;
          },
        },
        handler: adminController.changePassword,
        plugins: {
          'hapi-swagger': {
            id: 'change-password',
            responses: {
              200: {
                description: 'Should return status 200',
                schema: Joi.object({
                  message: Joi.string().required().example('Successful'),
                }).label('Admin'),
              },
            },
          },
        },
      },
    },
  ]);
};
