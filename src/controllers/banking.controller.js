/* eslint-disable no-return-await */
const config = require('config');
const { error } = require('../utils/error');
const constants = require('../utils/constants');
const banksList = require('../utils/banks.json');
const { verify, confirmAdmin } = require('../utils/tokenizer');

const paystackPaymentCollection = async (request) => {
  const signature = request.headers['x-paystack-signature'];
  const data = request.payload;
  return await request.server.app.services.banking.paystackPaymentCollectionService(
    data,
    signature,
  );
};

const monnifyPaymentCollection = async (request) => {
  const data = request.payload;
  return await request.server.app.services.banking.monnifyPaymentCollectionService(
    data,
  );
};

const kudaPaymentCollection = async (request) => {
  const { payload } = request;
  const response = await request.server.app.services.banking.kudaPaymentCollectionService(
    payload,
  );

  if (response.error) {
    return error(400, response.error);
  }
  return response;
};

// const getBankAccountDetails = async (request) => {
//   const isAdmin = await confirmAdmin(request);
//   const { business, user, role } = await verify(request.auth.credentials.token);
//   if (role === config.migrationIDs.BUSINESS_USER_ROLE_ID) {
//     request.query.user = user;
//   } else {
//     if (
//       !(await hasPermission(request, 'CAN CREATE BUSINESS WITHDRAWAL ACCOUNT'))
//     ) {
//       return error(403, 'Unauthorized');
//     }
//     if (!(await confirmBusinessAdmin(request)) && !isAdmin) {
//       return error(403, 'Unauthorized');
//     }
//   }
//   const response = await request.server.app.services.banking.getBankAccountDetails({
//     user,
//     business,
//     accountType: (await confirmBusinessAdmin(request))
//       ? 'Business'
//       : 'Employee',
//     isAdmin,
//   });
//   if (response.error) {
//     return error(400, response.error);
//   }
//   return response;
// };

const banks = async () => {
  const response = {
    totalCounts: banksList.length,
    banks: banksList,
  };
  return response;
};

const verifyAccountDetails = async (request) => {
  const { accountNumber, beneficiaryBank } = request.payload;
  const response = await request.server.app.services.banking.getNIPAccount({
    accountNumber,
    beneficiaryBank,
  });
  if (response.error) {
    return error(400, response.error);
  }
  return response;
};

const processFundTransfer = async (request) => {
  const { payload } = request;
  const { user } = await verify(request.auth.credentials.token);
  payload.user = user;
  const response = await request.server.app.services.banking.processTransfer(
    payload,
  );
  if (response.error) {
    return error(400, response.error);
  }
  return response;
};

const getAll = async (request) => {
  if (!await confirmAdmin(request)) {
    return error(400, 'Unauthorized');
  }
  const { user } = await verify(request.auth.credentials.token);
  request.query.user = user;
  const users = await request.server.app.services.banking.getAll(
    request.query,
  );
  return {
    count: users.value ? users.value.length : 0,
    users: users.value,
  };
};

const createExpenseCategory = async (request) => {
  if (!await confirmAdmin(request)) {
    return error(400, 'Unauthorized');
  }
  const { payload } = request;
  return await request.server.app.services.banking.createExpenseCategory(
    payload,
  );
};
// const kudaWithdraw = async (request) => {
//   if (await confirmAdmin(request)) {
//     return await request.server.app.services.banking.kudaWithdraw();
//   }

//   return error(403, 'Unauthorized');
// };

const updateExpenseCategory = async (request) => {
  if (!await confirmAdmin(request)) {
    return error(400, 'Unauthorized');
  }
  const expenseCategory = request.payload;
  const { id } = request.params;
  if (
    Object.keys(expenseCategory).length === 0
      && expenseCategory.constructor === Object
  ) {
    return error(400, constants.EmptyPayload);
  }
  const response = await request.server.app.services.banking.updateExpenseCategory(
    expenseCategory,
    id,
  );
  if (response.error) {
    return error(400, response.error);
  }
  return response;
};

const getAllBeneficiaries = async (request) => {
  const { user } = await verify(request.auth.credentials.token);
  request.query.user = user;
  const beneficiaries = await request.server.app.services.banking.getBeneficiaries(request.query);
  return {
    count: beneficiaries.value ? beneficiaries.value.length : 0,
    beneficiaries: beneficiaries.value,
  };
};

const getTransactions = async (request) => {
  const { user } = await verify(request.auth.credentials.token);
  request.query.user = user;
  const transactions = await request.server.app.services.banking.getAll(
    request.query,
  );
  return {
    count: transactions.value ? transactions.value.length : 0,
    transactions: transactions.value,
  };
};

const getAllExpenseCategories = async (request) => {
  const { query } = request;
  const expenseCategories = await request.server.app.services.banking.getAllExpensesCategories(query);
  return {
    count: expenseCategories.value ? expenseCategories.value.length : 0,
    expenseCategories: expenseCategories.value,
  };
};

const getUserBeneficiaries = async (request) => {
  const { user } = await verify(request.auth.credentials.token);
  request.query.user = user;
  const beneficiaries = await request.server.app.services.banking.getBeneficiaries(request.query);
  return {
    count: beneficiaries.value ? beneficiaries.value.length : 0,
    beneficiaries: beneficiaries.value,
  };
};

const deactivateExpenseCategory = async (request) => {
  const { id } = request.params;
  const response = await request.server.app.services.banking.deactivate(id);
  if (response.error) {
    return error(400, response.error);
  }
  return response;
};
const deactivateBeneficiary = async (request) => {
  const { id } = request.params;
  const { user } = await verify(request.auth.credentials.token);
  const response = await request.server.app.services.banking.deactivateBeneficiary(id, user);
  if (response.error) {
    return error(400, response.error);
  }
  return response;
};

module.exports = {
  verifyAccountDetails,
  processFundTransfer,
  banks,
  getAll,
  getAllExpenseCategories,
  getAllBeneficiaries,
  getTransactions,
  getUserBeneficiaries,
  createExpenseCategory,
  deactivateExpenseCategory,
  updateExpenseCategory,
  paystackPaymentCollection,
  kudaPaymentCollection,
  deactivateBeneficiary,
  monnifyPaymentCollection,
};
