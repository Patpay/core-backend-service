const Joi = require('joi');
const namespace = require('hapijs-namespace');
const configs = require('config');
const { merchantController } = require('../controllers');

function merchantResponse() {
  return {
    _id: Joi.string().required().example('5fb55fd471da0f122d564e7a'),
    fullname: Joi.string().required().example('State'),
    accountName: Joi.string().required().example('State'),
    accountNumber: Joi.string().required().example('State'),
    bank: Joi.string().required().example('State'),
    mobile: Joi.string().required().example('State'),
    category: Joi.string().required().example('5fb55fd471da0f122d564e7a'),
    status: Joi.boolean().example(true),
    value: Joi.number().required().example(1),
    updatedAt: Joi.string().required().example('2020-11-18T17:54:28.209Z'),
    createdAt: Joi.string().required().example('2020-11-18T17:54:28.209Z'),
  };
}

module.exports = (server, prefix) => {
  namespace(server, prefix, [
    {
      method: 'POST',
      path: '/merchant',
      config: {
        description: 'Create a merchant',
        tags: ['api', 'merchants'],
        auth: 'simple',
        cors: configs.cors,
        validate: {
          payload: Joi.object({
            merchantName: Joi.string().required().description('name of the merchants'),
            accountName: Joi.string()
              .required()
              .description('the merchants account number'),
            category: Joi.string().min(24).max(24).required()
              .description('this is the category of the business'),
            accountNumber: Joi.string().example(4).description('account number'),
            bank: Joi.string().example(4).description('bank name'),
            bankCode: Joi.string().required('the banks code'),
            mobile: Joi.string().example(4).description('mobile number'),
          }),
          failAction: async (request, h, err) => {
            throw err;
          },
        },
        handler: merchantController.create,
        plugins: {
          'hapi-swagger': {
            id: 'create-merchant',
            responses: {
              200: {
                description: 'Should return status 200',
                schema: Joi.object({
                  msg: Joi.string().example('Success'),
                  merchantId: Joi.string()
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
      path: '/all-merchants',
      config: {
        description: 'Get all merchants',
        tags: ['api', 'merchants'],
        handler: merchantController.getAllMerchants,
        auth: 'simple',
        cors: configs.cors,
        validate: {
          query: Joi.object({
            limit: Joi.number().description('max number of items to fetch'),
            offset: Joi.number().description('number of items to skip'),
            status: Joi.boolean().description('status of merchants'),
          }),
          failAction: async (request, h, err) => {
            throw err;
          },
        },
        plugins: {
          'hapi-swagger': {
            id: 'merchants',
            responses: {
              200: {
                description: 'Should return status 200',
                schema: Joi.object({
                  totalCounts: Joi.number().required().example('15'),
                  count: Joi.number().required().example('15'),
                  merchants: Joi.array().items(merchantResponse()),
                }).label('merchants'),
              },
            },
          },
        },
      },
    },
    {
      method: 'DELETE',
      path: '/merchant/{id}',
      config: {
        description: 'Delete merchant',
        tags: ['api', 'merchants'],
        auth: 'simple',
        cors: configs.cors,
        validate: {
          params: Joi.object({
            id: Joi.string().max(24).min(24).required(),
          }),
          failAction: async (request, h, err) => {
            throw err;
          },
        },
        handler: merchantController.deactivate,
        plugins: {
          'hapi-swagger': {
            id: 'delete-merchants',
            responses: {
              200: {
                description: 'Should return status 200',
                schema: Joi.object({
                  response: Joi.string().required().example('successful'),
                }).label('merchants'),
              },
            },
          },
        },
      },
    },
    {
      method: 'GET',
      path: '/merchant/{id}',
      config: {
        description: 'Get merchant by id',
        tags: ['api', 'merchants'],
        auth: 'simple',
        cors: configs.cors,
        validate: {
          params: Joi.object({
            id: Joi.string().max(24).min(24).required(),
          }),
          failAction: async (request, h, err) => {
            throw err;
          },
        },
        handler: merchantController.getById,
        plugins: {
          'hapi-swagger': {
            id: 'delete-merchants',
            responses: {
              200: {
                description: 'Should return status 200',
                schema: Joi.object({
                  response: Joi.string().required().example('successful'),
                }).label('merchants'),
              },
            },
          },
        },
      },
    },
  ]);
};
