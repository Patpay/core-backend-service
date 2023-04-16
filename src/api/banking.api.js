const namespace = require('hapijs-namespace');
const Joi = require('joi');
const configs = require('config');
const {
  bankingController,
} = require('../controllers');

function transResponse() {
  return {
    _id: Joi.string().required().example('5fb55fd471da0f122d564e7a'),
    transactionAmount: Joi.string().example('5000'),
    currencyCode: Joi.string().example('NGN'),
    user: Joi.string().example('5fb55fd471da0f122d564e7a'),
    sourceAccountName: Joi.string().example('Samuel'),
    beneficiaryAccountNumber: Joi.string().example('1234567890'),
    updatedAt: Joi.string().example('2020-11-18T17:54:28.209Z'),
    createdAt: Joi.string().example('2020-11-18T17:54:28.209Z'),
    beneficiaryAccountName: Joi.string().optional().example('Otunba Samuel'),
    beneficiaryBank: Joi.string().example('00034'),
    bankName: Joi.string().example('GTB'),
    responseCode: Joi.string().example('00'),
    responseMessage: Joi.string().example('Successful'),
    narration: Joi.string().example('purchase of chairs'),
  };
}

function beneficiariesResponse() {
  return {
    _id: Joi.string().required().example('5fb55fd471da0f122d564e7a'),
    user: Joi.string().example('5fb55fd471da0f122d564e7a'),
    accountNumber: Joi.string().example('1234567890'),
    bankName: Joi.string().example('Fidelity'),
    updatedAt: Joi.string().example('2020-11-18T17:54:28.209Z'),
    createdAt: Joi.string().example('2020-11-18T17:54:28.209Z'),
    accountName: Joi.string().optional().example('Otunba Samuel'),
    bankCode: Joi.string().example('00034'),
  };
}

module.exports = (server, prefix) => {
  namespace(server, prefix, [
    {
      method: 'POST',
      path: '/paystack/settlement_notif',
      config: {
        description: 'paystack webhook notification',
        tags: ['api', 'banking'],
        handler: bankingController.paystackPaymentCollection,
        plugins: {
          'hapi-swagger': {
            id: 'paystack-payment-collection',
            responses: {
              200: {
                description: 'transaction response',
              },
            },
          },
        },
      },
    },
    {
      method: 'POST',
      path: '/monnify/settlement_notif',
      config: {
        description: 'monnify webhook notification',
        tags: ['api', 'banking'],
        handler: bankingController.monnifyPaymentCollection,
        plugins: {
          'hapi-swagger': {
            id: 'monnify-payment-collection',
            responses: {
              200: {
                description: 'transaction response',
              },
            },
          },
        },
      },
    },
    {
      method: 'POST',
      path: '/kuda/settlemet_notif',
      config: {
        description: 'kuda webhook notification',
        tags: ['api', 'banking'],
        handler: bankingController.kudaPaymentCollection,
        plugins: {
          'hapi-swagger': {
            id: 'kuda-payment-collection',
            responses: {
              200: {
                description: 'transaction response',
              },
            },
          },
        },
      },
    },
    {
      method: 'GET',
      path: '/banks',
      config: {
        description: 'Get all banks',
        tags: ['api', 'banking'],
        handler: bankingController.banks,
        auth: 'simple',
        cors: configs.cors,
        plugins: {
          'hapi-swagger': {
            id: 'banks',
            responses: {
              200: {
                description: 'Should return status 200',
                schema: Joi.object({
                  totalCounts: Joi.number().required().example('15'),
                  banks: Joi.array().items({
                    bankCode: '000001',
                    bankName: 'Providus',
                  }),
                }).label('bank'),
              },
            },
          },
        },
      },
    },
    {
      method: 'POST',
      path: '/bank/verify-account-details',
      config: {
        description: 'virtual account transaction collection',
        tags: ['api', 'banking'],
        auth: 'simple',
        validate: {
          payload: Joi.object({
            accountNumber: Joi.string()
              .required()
              .max(10)
              .min(10)
              .example('1234567890')
              .description('beneficiary account number'),
            beneficiaryBank: Joi.string()
              .required()
              .example('00012')
              .description('beneficiaryBank code'),

          }),
          failAction: async (request, h, err) => {
            throw err;
          },
        },
        handler: bankingController.verifyAccountDetails,
        plugins: {
          'hapi-swagger': {
            id: 'verify-account-details',
            responses: {
              200: {
                accountName: Joi.object({ accountName: 'Donald Sam' }),
              },
            },
          },
        },
      },
    },
    {
      method: 'POST',
      path: '/bank/verify-bana-details',
      config: {
        description: 'verify bana account details',
        tags: ['api', 'banking'],
        auth: 'simple',
        validate: {
          payload: Joi.object({
            banaId: Joi.string()
              .required()
              .max(10)
              .min(10)
              .example('KENNY67890')
              .description('user bana id'),

          }),
          failAction: async (request, h, err) => {
            throw err;
          },
        },
        handler: bankingController.verifyBanaAccount,
        plugins: {
          'hapi-swagger': {
            id: 'verify-bana-details',
            responses: {
              200: {
                accountName: Joi.object({ banaName: 'Donald Sam' }),
              },
            },
          },
        },
      },
    },
    {
      method: 'POST',
      path: '/bank/verify-merchant-details',
      config: {
        description: 'verify bana merchant account details',
        tags: ['api', 'banking'],
        auth: 'simple',
        validate: {
          payload: Joi.object({
            banaId: Joi.string()
              .required()
              .max(10)
              .min(10)
              .example('KENNY67890')
              .description('user bana id'),

          }),
          failAction: async (request, h, err) => {
            throw err;
          },
        },
        handler: bankingController.verifyMerchantAccount,
        plugins: {
          'hapi-swagger': {
            id: 'verify-bana-details',
            responses: {
              200: {
                accountName: Joi.object({ banaName: 'Donald Sam' }),
              },
            },
          },
        },
      },
    },
    {
      method: 'GET',
      path: '/transactions',
      config: {
        description: 'Get all transactions',
        tags: ['api', 'banking'],
        handler: bankingController.getAll,
        auth: 'simple',
        cors: configs.cors,
        validate: {
          query: Joi.object({
            limit: Joi.number().description('max number of items to fetch'),
            offset: Joi.number().description('number of items to skip'),
            createdAt: Joi.number().valid(1, -1).description('getting transactions by date 1 is for old to new and -1 is for new to old'),
            transactionAmount: Joi.string().description('amount transfered'),
            user: Joi.string().optional().min(24).max(24),
            beneficiaryBank: Joi.string().optional(),
            transactionReference: Joi.boolean().example(true),
          }),
          failAction: async (request, h, err) => {
            throw err;
          },
        },
        plugins: {
          'hapi-swagger': {
            id: 'transactions',
            responses: {
              200: {
                description: 'Should return status 200',
                schema: Joi.object({
                  transactions: Joi.array().items(transResponse()),
                  count: Joi.number(),
                })
                  .label('User'),
              },
            },
          },
        },
      },
    },
    {
      method: 'GET',
      path: '/beneficiaries',
      config: {
        description: 'Get all beneficiaries',
        tags: ['api', 'banking'],
        handler: bankingController.getAllBeneficiaries,
        auth: 'simple',
        cors: configs.cors,
        validate: {
          query: Joi.object({
            limit: Joi.number().description('max number of items to fetch'),
            offset: Joi.number().description('number of items to skip'),
            user: Joi.string().optional().min(24).max(24),
            beneficiaryBank: Joi.string().optional(),
            beneficiaryAccountName: Joi.string().optional(),
          }),
          failAction: async (request, h, err) => {
            throw err;
          },
        },
        plugins: {
          'hapi-swagger': {
            id: 'beneficiaries',
            responses: {
              200: {
                description: 'Should return status 200',
                schema: Joi.object({
                  beneficiaries: Joi.array().items(beneficiariesResponse()),
                  count: Joi.number(),
                })
                  .label('User'),
              },
            },
          },
        },
      },
    },
    {
      method: 'GET',
      path: '/beneficiaries/user',
      config: {
        description: 'Get all beneficiaries',
        tags: ['api', 'banking'],
        handler: bankingController.getUserBeneficiaries,
        auth: 'simple',
        cors: configs.cors,
        validate: {
          query: Joi.object({
            limit: Joi.number().description('max number of items to fetch'),
            offset: Joi.number().description('number of items to skip'),
            beneficiaryBank: Joi.string().optional(),
            beneficiaryAccountName: Joi.string().optional(),
          }),
          failAction: async (request, h, err) => {
            throw err;
          },
        },
        plugins: {
          'hapi-swagger': {
            id: 'user-beneficiaries',
            responses: {
              200: {
                description: 'Should return status 200',
                schema: Joi.object({
                  beneficiaries: Joi.array().items(beneficiariesResponse()),
                  count: Joi.number(),
                })
                  .label('user'),
              },
            },
          },
        },
      },
    },
    {
      method: 'GET',
      path: '/transactions/user',
      config: {
        description: 'Get all transactions',
        tags: ['api', 'banking'],
        handler: bankingController.getTransactions,
        auth: 'simple',
        cors: configs.cors,
        validate: {
          query: Joi.object({
            limit: Joi.number().description('max number of items to fetch'),
            offset: Joi.number().description('number of items to skip'),
            transactionReference: Joi.boolean().example(true),
          }),
          failAction: async (request, h, err) => {
            throw err;
          },
        },
        plugins: {
          'hapi-swagger': {
            id: 'user-transactions',
            responses: {
              200: {
                description: 'Should return status 200',
                schema: Joi.object({
                  transactions: Joi.array().items(transResponse()),
                  count: Joi.number(),
                })
                  .label('Providus'),
              },
            },
          },
        },
      },
    },
    {
      method: 'GET',
      path: '/expense-categories',
      config: {
        description: 'Get all expense categories',
        tags: ['api', 'expenseCategories'],
        handler: bankingController.getAllExpenseCategories,
        auth: 'simple',
        cors: configs.cors,
        validate: {
          query: Joi.object({
            limit: Joi.number().description('max number of items to fetch'),
            offset: Joi.number().description('number of items to skip'),
          }),
          failAction: async (request, h, err) => {
            throw err;
          },
        },
        plugins: {
          'hapi-swagger': {
            id: 'expense-categories',
            responses: {
              200: {
                description: 'Should return status 200',
                schema: Joi.object({
                  transactions: Joi.array().items({
                    name: Joi.string(),
                  }),
                  count: Joi.number(),
                })
                  .label('ExpenseCategories'),
              },
            },
          },
        },
      },
    },
    {
      method: 'POST',
      path: '/bank/fund-transfer',
      config: {
        description: 'transfer api',
        tags: ['api', 'banking'],
        auth: 'simple',
        validate: {
          payload: Joi.object({
            beneficiaryBank: Joi.string()
              .required()
              .example('00012')
              .description('beneficiaryBank code'),
            beneficiaryAccountNumber: Joi.string()
              .required()
              .max(10)
              .min(10)
              .example('1234567890')
              .description('beneficiary Account number'),
            pin: Joi.string()
              .min(4)
              .max(4)
              .required()
              .example('0000'),
            transactionAmount: Joi.number()
              .required()
              .min(1)
              .example(5000)
              .description('transactionAmount in naira'),
            expenseCategory: Joi.string()
              .optional()
              .max(24)
              .min(24)
              .example('5fb55fd471da0f122d564e7a')
              .description('beneficiary Account number'),
            currencyCode: Joi.string()
              .required()
              .example('NGN'),
            nickName: Joi.string()
              .optional(),
            saveBeneficiary: Joi.boolean()
              .required()
              .example(true)
              .description('save Beneficiary'),
            narration: Joi.string()
              .allow('')
              .example('for item description')
              .description('description'),
          }),
          failAction: async (request, h, err) => {
            throw err;
          },
        },
        handler: bankingController.processFundTransfer,
        plugins: {
          'hapi-swagger': {
            id: 'transfer-api',
            responses: {
              200: {
                accountName: Joi.string().example('Successful'),
              },
            },
          },
        },
      },
    },
    {
      method: 'POST',
      path: '/bank/bana-fund-transfer',
      config: {
        description: 'transfer api',
        tags: ['api', 'banking'],
        auth: 'simple',
        validate: {
          payload: Joi.object({
            banaId: Joi.string()
              .required()
              .max(10)
              .min(10)
              .example('1234567890')
              .description('beneficiary Account number'),
            pin: Joi.string()
              .min(4)
              .max(4)
              .required()
              .example('0000'),
            transactionAmount: Joi.number()
              .required()
              .min(1)
              .example(5000)
              .description('transactionAmount in naira'),
            expenseCategory: Joi.string()
              .optional()
              .max(24)
              .min(24)
              .example('5fb55fd471da0f122d564e7a')
              .description('beneficiary Account number'),
            currencyCode: Joi.string()
              .required()
              .example('NGN'),
            narration: Joi.string()
              .allow('')
              .example('for item description')
              .description('description'),
          }),
          failAction: async (request, h, err) => {
            throw err;
          },
        },
        handler: bankingController.sendMoneyToBanaAccount,
        plugins: {
          'hapi-swagger': {
            id: 'transfer-api',
            responses: {
              200: {
                accountName: Joi.string().example('Successful'),
              },
            },
          },
        },
      },
    },
    {
      method: 'POST',
      path: '/bank/merchant-fund-transfer',
      config: {
        description: 'transfer api',
        tags: ['api', 'banking'],
        auth: 'simple',
        validate: {
          payload: Joi.object({
            merchantId: Joi.string()
              .required()
              .max(10)
              .min(10)
              .example('1234567890')
              .description('beneficiary Account number'),
            pin: Joi.string()
              .min(4)
              .max(4)
              .required()
              .example('0000'),
            transactionAmount: Joi.number()
              .required()
              .min(1)
              .example(5000)
              .description('transactionAmount in naira'),
            expenseCategory: Joi.string()
              .optional()
              .max(24)
              .min(24)
              .example('5fb55fd471da0f122d564e7a')
              .description('beneficiary Account number'),
            saveMerchant: Joi.boolean()
              .required()
              .default(false)
              .example('NGN'),
          }),
          failAction: async (request, h, err) => {
            throw err;
          },
        },
        handler: bankingController.sendMoneyMerchant,
        plugins: {
          'hapi-swagger': {
            id: 'transfer-api',
            responses: {
              200: {
                accountName: Joi.string().example('Successful'),
              },
            },
          },
        },
      },
    },
    {
      method: 'DELETE',
      path: '/expense-category/{id}',
      config: {
        description: 'Delete expenseCategory',
        tags: ['api', 'expenseCategories'],
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
        handler: bankingController.deactivateExpenseCategory,
        plugins: {
          'hapi-swagger': {
            id: 'expense-category-delete',
            responses: {
              200: {
                description: 'Should return status 200',
                schema: Joi.object({
                  response: Joi.string().required().example('successful'),
                }).label('ExpenseCategory'),
              },
            },
          },
        },
      },
    },
    {
      method: 'DELETE',
      path: '/beneficiary/{id}',
      config: {
        description: 'Delete beneficiary',
        tags: ['api', 'banking'],
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
        handler: bankingController.deactivateBeneficiary,
        plugins: {
          'hapi-swagger': {
            id: 'beneficiary-delete',
            responses: {
              200: {
                description: 'Should return status 200',
                schema: Joi.object({
                  response: Joi.string().required().example('successful'),
                }).label('deactivateBeneficiary'),
              },
            },
          },
        },
      },
    },
    {
      method: 'PUT',
      path: '/expenseCategory/{id}',
      config: {
        description: 'Update expense category',
        tags: ['api', 'expenseCategories'],
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
              .required()
              .example('Dollars')
              .description('expenseCategory name'),
          }),
          failAction: async (request, h, err) => {
            throw err;
          },
        },
        handler: bankingController.updateExpenseCategory,
        plugins: {
          'hapi-swagger': {
            id: 'update-expenseCategory',
            responses: {
              200: {
                description: 'Should return status 200',
                schema: Joi.object({
                  name: Joi.string().example('Federal'),
                  status: Joi.string().example('status'),
                }).label('ExpenseCategory'),
              },

            },
          },
        },
      },
    },
    // {
    //   method: 'GET',
    //   path: '/reconcile-kuda',
    //   config: {
    //     description: 'Reconcile Kuda',
    //     tags: ['api', 'banking'],
    //     auth: 'simple',
    //     cors: configs.cors,
    //     handler: bankingController.kudaWithdraw,
    //     plugins: {
    //       'hapi-swagger': {
    //         id: 'reconcile-kuda-main',
    //         responses: {
    //           200: {
    //             description: 'Should return status 200',
    //             schema: Joi.object({
    //               msg: Joi.string(),
    //             }),
    //           },
    //         },
    //       },
    //     },
    //   },
    // },
    {
      method: 'POST',
      path: '/expense-categories',
      config: {
        description: 'expense categories api',
        tags: ['api', 'expenseCategories'],
        auth: 'simple',
        validate: {
          payload: Joi.object({
            name: Joi.string()
              .required()
              .example('Bookeeping')
              .description('Expense categories'),
          }),
          failAction: async (request, h, err) => {
            throw err;
          },
        },
        handler: bankingController.createExpenseCategory,
        plugins: {
          'hapi-swagger': {
            id: 'expense-categories-api',
            responses: {
              200: {
                description: 'Should return status 200',
                schema: Joi.object({
                  message: Joi.string().example('Success'),
                }),
              },
            },
          },
        },
      },
    },
  ]);
};
