const Joi = require('joi');
const namespace = require('hapijs-namespace');
const configs = require('config');
const { bankAccountController } = require('../controllers');

function bankAccountResponse() {
  return {
    _id: Joi.string().required().example('5fb55fd471da0f122d564e7a'),
    users: Joi.array()
      .items(Joi.string().required().example('5fb55fd471da0f122d564e7a'))
      .required()
      .example(['5fb55fd471da0f122d564e7a']),
    accountName: Joi.string().required().example('user Account'),
    accountNumber: Joi.string().required().example('123456789'),
    bankCode: Joi.string().optional().example('123456789'),
    provider: Joi.string().required().example('Providus'),
    isSuccessful: Joi.boolean().required().example(false),
    updatedAt: Joi.string().required().example('2020-11-18T17:54:28.209Z'),
    createdAt: Joi.string().required().example('2020-11-18T17:54:28.209Z'),
  };
}

module.exports = (server, prefix) => {
  namespace(server, prefix, [
    {
      method: 'GET',
      path: '/',
      config: {
        description: 'Get all bankAccounts',
        tags: ['api', 'bankAccounts'],
        handler: bankAccountController.getAll,
        auth: 'simple',
        cors: configs.cors,
        validate: {
          query: Joi.object({
            limit: Joi.number().description('max number of items to fetch'),
            offset: Joi.number().description('number of items to skip'),
            user: Joi.string().optional().description('user id'),
            provider: Joi.string().optional().description('provider'),
          }),
          failAction: async (request, h, err) => {
            throw err;
          },
        },
        plugins: {
          'hapi-swagger': {
            id: 'get-all-bankAccounts',
            responses: {
              200: {
                description: 'Should return status 200',
                schema: Joi.object({
                  totalCounts: Joi.number().required().example('15'),
                  bankAccounts: Joi.array().items(bankAccountResponse()),
                }).label('BankAccounts'),
              },
            },
          },
        },
      },
    },
    {
      method: 'POST',
      path: '/user/withdrawal',
      config: {
        description: 'config bank withdrawal api',
        tags: ['api', 'bankAccounts'],
        handler: bankAccountController.createWithdrawalAccount,
        auth: 'simple',
        cors: configs.cors,
        validate: {
          payload: Joi.object({
            bankCode: Joi.string().required().example('123456789'),
            bank: Joi.string().required().example('UARANTY TRUST BANK'),
            accountName: Joi.string().required().example('user Account'),
            accountNumber: Joi.string().min(10).max(10).required().example('123456789'),
          }),
          failAction: async (request, h, err) => {
            throw err;
          },
        },
        plugins: {
          'hapi-swagger': {
            id: 'create-withdrawal-provider',
            responses: {
              200: {
                description: 'Should return status 200',
                schema: Joi.object({
                  totalCounts: Joi.number().required().example('15'),
                  bankAccounts: Joi.array().items(bankAccountResponse()),
                }).label('BankAccounts'),
              },
            },
          },
        },
      },
    },
    {
      method: 'GET',
      path: '/withdrawal-user',
      config: {
        description: 'config user withdrawal api',
        tags: ['api', 'bankAccounts'],
        handler: bankAccountController.getWithdrawalAcct,
        auth: 'simple',
        cors: configs.cors,
        plugins: {
          'hapi-swagger': {
            id: 'user-withdrawal',
            responses: {
              200: {
                description: 'Should return status 200',
                schema: Joi.object(bankAccountResponse()).label('BankAccounts'),
              },
            },
          },
        },
      },

    },

    // get bankAccount by id
    {
      method: 'GET',
      path: '/{id}',
      config: {
        description: 'Get bankAccount by id',
        tags: ['api', 'bankAccounts'],
        handler: bankAccountController.getById,
        auth: 'simple',
        cors: configs.cors,
        validate: {
          params: Joi.object({
            id: Joi.string().required().example('5fb55fd471da0f122d564e7a'),
          }),
          failAction: async (request, h, err) => {
            throw err;
          },
        },
        plugins: {
          'hapi-swagger': {
            id: 'get-bankAccount-by-id',
            responses: {
              200: {
                description: 'Should return status 200',
                schema: bankAccountResponse(),
              },
            },
          },
        },
      },
    },
    // update bankAccount
    {
      method: 'PUT',
      path: '/{id}',
      config: {
        description: 'Update bankAccount',
        tags: ['api', 'bankAccounts'],
        handler: bankAccountController.update,
        auth: 'simple',
        cors: configs.cors,
        validate: {
          params: Joi.object({
            id: Joi.string().required().example('5fb55fd471da0f122d564e7a'),
          }),
          payload: Joi.object({
            accountName: Joi.string().optional().example('user Account'),
            accountNumber: Joi.string().min(10).max(10).optional().example('123456789'),
            bvn: Joi.string().optional().example('123456789'),
            bankCode: Joi.string().optional().example('123456789'),
            isSuccessful: Joi.boolean().optional().example(false),
          }),
          failAction: async (request, h, err) => {
            throw err;
          },
        },
        plugins: {
          'hapi-swagger': {
            id: 'update-bankAccount',
            responses: {
              200: {
                description: 'Should return status 200',
                schema: bankAccountResponse(),
              },
            },
          },
        },
      },
    },
  ]);
};
