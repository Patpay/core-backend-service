const Joi = require('joi');
const namespace = require('hapijs-namespace');
const configs = require('config');
const {
  roleController,
} = require('../controllers');

function roleResponse() {
  return {
    _id: Joi.string().required().example('5fb55fd471da0f122d564e7a'),
    name: Joi.string().required().example('State'),
    status: Joi.boolean().example(true),
    description: Joi.string().required().example('Helo Role'),
    updatedAt: Joi.string().required().example('2020-11-18T17:54:28.209Z'),
    createdAt: Joi.string().required().example('2020-11-18T17:54:28.209Z'),
  };
}

module.exports = (server, prefix) => {
  namespace(server, prefix, [

    {
      method: 'POST',
      path: '/role',
      config: {
        description: 'Create a role',
        tags: ['api', 'roles'],
        auth: 'simple',
        cors: configs.cors,
        validate: {
          payload: Joi.object({
            name: Joi.string()
              .required()
              .example('Federal')
              .description('role name'),
            description: Joi.string()
              .required()
              .example('Hello Role')
              .description('role'),
          }),
          failAction: async (request, h, err) => {
            throw err;
          },
        },
        handler: roleController.create,
        plugins: {
          'hapi-swagger': {
            id: 'create-role',
            responses: {
              200: {
                description: 'Should return status 200',
                schema: Joi.object({
                  msg: Joi.string().example('Success'),
                  roleId: Joi.string().required().example('5fb55fd471da0f122d564e7a'),
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
        description: 'Get all roles',
        tags: ['api', 'roles'],
        handler: roleController.getAll,
        auth: 'simple',
        cors: configs.cors,
        validate: {
          query: Joi.object({
            limit: Joi.number()
              .description('max number of items to fetch'),
            offset: Joi.number()
              .description('number of items to skip'),
            status: Joi.boolean()
              .description('status of role'),
          }),
          failAction: async (request, h, err) => {
            throw err;
          },
        },
        plugins: {
          'hapi-swagger': {
            id: 'roles',
            responses: {
              200: {
                description: 'Should return status 200',
                schema: Joi.object({
                  totalCounts: Joi.number().required().example('15'),
                  count: Joi.number().required().example('15'),
                  roles: Joi.array().items(roleResponse()),
                }).label('role'),
              },
            },
          },
        },
      },
    },
    {
      method: 'GET',
      path: '/role/{id}',
      config: {
        description: 'Get single role by ID',
        tags: ['api', 'roles'],
        auth: 'simple',
        cors: configs.cors,
        validate: {
          params: Joi.object({
            id: Joi.string()
              .required()
              .min(24)
              .max(24)
              .description('the id of the role to return'),
          }),
          failAction: async (request, h, err) => {
            throw err;
          },
        },
        handler: roleController.getRole,
        plugins: {
          'hapi-swagger': {
            id: 'role',
            responses: {
              200: {
                description: 'Should return status 200',
                schema: Joi.object(roleResponse()).label('role'),
              },

            },
          },
        },
      },
    },
    {
      method: 'PUT',
      path: '/role/{id}',
      config: {
        description: 'Update a role',
        tags: ['api', 'roles'],
        auth: 'simple',
        cors: configs.cors,
        validate: {
          params: Joi.object({
            id: Joi.string()
              .max(24)
              .min(24)
              .required(),
          }),
          payload: Joi.object({
            name: Joi.string()
              .example('Federal')
              .description('role name'),
            description: Joi.string()
              .min(0)
              .max(100)
              .example(4)
              .description('role'),
          }),
          failAction: async (request, h, err) => {
            throw err;
          },
        },
        handler: roleController.update,
        plugins: {
          'hapi-swagger': {
            id: 'update-role',
            responses: {
              200: {
                description: 'Should return status 200',
                schema: Joi.object(roleResponse()).label('role'),
              },

            },
          },
        },
      },
    },
    {
      method: 'DELETE',
      path: '/role/{id}',
      config: {
        description: 'Delete role',
        tags: ['api', 'roles'],
        auth: 'simple',
        cors: configs.cors,
        validate: {
          params: Joi.object({
            id: Joi.string()
              .max(24)
              .min(24)
              .required(),
          }),
          failAction: async (request, h, err) => {
            throw err;
          },
        },
        handler: roleController.deactivate,
        plugins: {
          'hapi-swagger': {
            id: 'delete-role',
            responses: {
              200: {
                description: 'Should return status 200',
                schema: Joi.object({
                  response: Joi.string().required().example('successful'),
                }).label('role'),
              },
            },
          },
        },
      },
    },
  ]);
};
