const Joi = require('joi');
const namespace = require('hapijs-namespace');
const configs = require('config');
const { chargesController } = require('../controllers');

function chargesResponse() {
  return {
    _id: Joi.string().required().example('5fb55fd471da0f122d564e7a'),
    type: Joi.string().required().example('State'),
    range: Joi.object({
      min: 0,
      max: 100000,
    }),
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
      path: '/charge',
      config: {
        description: 'Create a charge',
        tags: ['api', 'charges'],
        auth: 'simple',
        cors: configs.cors,
        validate: {
          payload: Joi.object({
            name: Joi.string().required().description('name of the charge'),
            type: Joi.string()
              .required()
              .valid('Percentage', 'Fixed')
              .description('charge'),
            minRange: Joi.number().min(0).example(4).description('Min charge'),
            maxRange: Joi.number().min(0).example(4).description('Max charge'),
            value: Joi.number()
              .required()
              .example(4)
              .description('charge value'),
          }),
          failAction: async (request, h, err) => {
            throw err;
          },
        },
        handler: chargesController.create,
        plugins: {
          'hapi-swagger': {
            id: 'create-charge',
            responses: {
              200: {
                description: 'Should return status 200',
                schema: Joi.object({
                  msg: Joi.string().example('Success'),
                  chargeId: Joi.string()
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
      path: '/all-charges',
      config: {
        description: 'Get all charges',
        tags: ['api', 'charges'],
        handler: chargesController.getAllCharges,
        auth: 'simple',
        cors: configs.cors,
        validate: {
          query: Joi.object({
            limit: Joi.number().description('max number of items to fetch'),
            offset: Joi.number().description('number of items to skip'),
            status: Joi.boolean().description('status of charge'),
          }),
          failAction: async (request, h, err) => {
            throw err;
          },
        },
        plugins: {
          'hapi-swagger': {
            id: 'charges',
            responses: {
              200: {
                description: 'Should return status 200',
                schema: Joi.object({
                  totalCounts: Joi.number().required().example('15'),
                  count: Joi.number().required().example('15'),
                  charges: Joi.array().items(chargesResponse()),
                }).label('charge'),
              },
            },
          },
        },
      },
    },
    {
      method: 'GET',
      path: '/all-inflow-charges',
      config: {
        description: 'Get all charges',
        tags: ['api', 'charges'],
        handler: chargesController.getAllInflowCharges,
        auth: 'simple',
        cors: configs.cors,
        validate: {
          query: Joi.object({
            limit: Joi.number().description('max number of items to fetch'),
            offset: Joi.number().description('number of items to skip'),
            business: Joi.string().min(24).max(24).description('business id'),
            charge: Joi.string().min(24).max(24).description('charge ID'),
          }),
          failAction: async (request, h, err) => {
            throw err;
          },
        },
        plugins: {
          'hapi-swagger': {
            id: 'inflow-charges',
            responses: {
              200: {
                description: 'Should return status 200',
                schema: Joi.object({
                  totalCounts: Joi.number().required().example('15'),
                  count: Joi.number().required().example('15'),
                  charges: Joi.array().items(chargesResponse()),
                }).label('charge'),
              },
            },
          },
        },
      },
    },
    {
      method: 'GET',
      path: '/calculate-charge',
      config: {
        description: 'Calculate charges',
        tags: ['api', 'charges'],
        handler: chargesController.calculateCharge,
        auth: 'simple',
        cors: configs.cors,
        validate: {
          query: Joi.object({
            quantity: Joi.number().optional().description('number of quantities'),
            name: Joi.string().required().description('name of Charge'),
            amount: Joi.number().optional().description('amount'),
          }),
          failAction: async (request, h, err) => {
            throw err;
          },
        },
        plugins: {
          'hapi-swagger': {
            id: 'calculate-charges',
            responses: {
              200: {
                description: 'Should return status 200',
                schema: Joi.number().label('charge'),
              },
            },
          },
        },
      },
    },
    {
      method: 'DELETE',
      path: '/charge/{id}',
      config: {
        description: 'Delete charge',
        tags: ['api', 'charges'],
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
        handler: chargesController.deactivate,
        plugins: {
          'hapi-swagger': {
            id: 'delete-charge',
            responses: {
              200: {
                description: 'Should return status 200',
                schema: Joi.object({
                  response: Joi.string().required().example('successful'),
                }).label('charge'),
              },
            },
          },
        },
      },
    },
  ]);
};
