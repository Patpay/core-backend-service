const { User } = require('./user/index');
const { BankAccount } = require('./bankAccount/index');
const { Wallet } = require('./wallet/index');
const { ExpenseCategory } = require('./expenseCategory/index');
const { Transaction } = require('./transaction/index');
const { KudaPaymentCollection } = require('./kudaPaymentCollection/index');
const { Charges } = require('./charges/index');
const { InflowCharge } = require('./inflowCharge/index');
const { BVN } = require('./bvn/index');
const { Kuda } = require('./kuda/index');
const { PaystackPaymentCollection } = require('./paystackPaymentCollection/index');
const { KudaTransferTracker } = require('./kudaTransferTracker/index');
const { TransferRecon } = require('./transferPaymentReconcilation/index');
const { Beneficiary } = require('./beneficiary/index');
const { TransferTrans } = require('./transferTransaction/index');
const { Merchant } = require('./merchant/index');
const { Admin } = require('./admin/index');
const { Role } = require('./role/index');

module.exports = {
  User,
  BankAccount,
  Wallet,
  ExpenseCategory,
  Transaction,
  KudaPaymentCollection,
  Charges,
  InflowCharge,
  BVN,
  PaystackPaymentCollection,
  Kuda,
  KudaTransferTracker,
  TransferRecon,
  Beneficiary,
  TransferTrans,
  Merchant,
  Admin,
  Role,
};
