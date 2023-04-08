const Joi = require('joi');
const namespace = require('hapijs-namespace');
const configs = require('config');
const { walletController } = require('../controllers');

function walletResponse() {
  return {
    balance: Joi.number().example(20000),
    user: Joi.string().example('5fb55fd471da0f122d564e7a'),
    status: Joi.string().valid('ACTIVE', 'INACTIVE', 'TERMINATED'),
    updatedAt: Joi.string().example('2020-11-18T17:54:28.209Z'),
    createdAt: Joi.string().example('2020-11-18T17:54:28.209Z'),
  };
}

module.exports = (server, prefix) => {
  namespace(server, prefix, [
    {
      method: 'GET',
      path: '/user',
      config: {
        description: 'Get single wallet by ID',
        tags: ['api', 'wallet'],
        auth: 'simple',
        cors: configs.cors,
        handler: walletController.getWallet,
        plugins: {
          'hapi-swagger': {
            id: 'getusersWallet',
            responses: {
              200: {
                description: 'Should return status 200',
                schema: Joi.object(walletResponse()).label('user-wallet'),
              },
            },
          },
        },
      },
    },
    {
      method: 'GET',
      path: '/new/user',
      config: {
        description: 'Get wallets',
        tags: ['api', 'wallet'],
        auth: 'simple',
        cors: configs.cors,
        handler: walletController.getWallets,
        plugins: {
          'hapi-swagger': {
            id: 'getUserWallet',
            responses: {
              200: {
                description: 'Should return status 200',
                schema: Joi.object(walletResponse()).label('user-wallet'),
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
        description: 'Get all wallets',
        tags: ['api', 'wallet'],
        handler: walletController.getAll,
        auth: 'simple',
        cors: configs.cors,
        validate: {
          query: Joi.object({
            limit: Joi.number().description('max number of items to fetch'),
            offset: Joi.number().description('number of items to skip'),
            user: Joi.string()
              .min(24)
              .max(24)
              .description('user of the wallet'),
            balance: Joi.number().description('amount in the account'),
            status: Joi.string().valid('ACTIVE', 'INACTIVE', 'TERMINATED'),
          }),
          failAction: async (request, h, err) => {
            throw err;
          },
        },
        plugins: {
          'hapi-swagger': {
            id: 'getAll-wallets',
            responses: {
              200: {
                description: 'Should return status 200',
                schema: Joi.object({
                  totalCounts: Joi.number().required().example('15'),
                  count: Joi.number().required().example('15'),
                  wallets: Joi.array().items(walletResponse()),
                }).label('wallets'),
              },
            },
          },
        },
      },
    },
  ]);
};
