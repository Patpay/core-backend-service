/* eslint-disable no-nested-ternary */
/* eslint-disable camelcase */
const axios = require('axios');
const { logger } = require('./logger');
const { paystack } = require('../../config/default');
const constants = require('./constants');

const getHeaders = () => ({
  Authorization: `Bearer ${paystack.PAYSTACK_SECRET_KEY}`,
  'Content-Type': 'application/json',
});

const axiosInstance = axios.create({
  baseURL: paystack.PAYSTACK_BASE_URL,
  timeout: Number(paystack.CONNECTION_TIMEOUT),
  headers: getHeaders(),
});

exports.chargeBusiness = async (payload) => {
  try {
    const response = await axiosInstance.post('/charge', payload);
    return {
      status: response.data.data.status,
      authorization: response.data.data.authorization,
    };
  } catch (e) {
    logger.log({
      level: 'error',
      message: e,
    });
    throw Error(constants.GONE_BAD);
  }
};

exports.checkAuthorization = async (amount, email, authorization_code) => {
  try {
    const response = await axiosInstance.post(
      '/transaction/check_authorization',
      amount,
      email,
      authorization_code,
    );
    return {
      status: response.data.status,
    };
  } catch (e) {
    logger.log({
      level: 'error',
      message: e,
    });
    throw Error(constants.GONE_BAD);
  }
};

exports.generatePaymentLink = async ({
  amount,
  email,
  currency,
  reference,
  metadata,
}) => {
  try {
    let totalAmount = amount < 2500
      ? amount + (amount * 0.015)
      : (amount * 0.015) + 100 < 2000
        ? (amount * 0.015) + 100 + amount
        : amount + 2000;
    totalAmount *= 100;
    const response = await axiosInstance.post('/transaction/initialize', {
      amount: totalAmount,
      email,
      currency,
      reference,
      metadata,
    });
    return response.data.data;
  } catch (error) {
    logger.log({
      level: 'error',
      message: error,
    });
    return { error: constants.GONE_BAD };
  }
};

exports.transactionAmount = (totalAmount) => {
  const amountPaid = (totalAmount / 100 - 100) / 1.015;
  const charges = amountPaid * 0.015 + 100;

  if (charges < 2000) {
    return totalAmount / 100 - charges;
  }
  return totalAmount / 100 - 2000;
};

exports.chargeAuthorization = async (amount, email, authorization_code) => {
  try {
    const response = await axiosInstance.post(
      '/transaction/charge_authorization',
      amount,
      email,
      authorization_code,
    );
    return {
      debitStatus: response.data.data.status,
      response: response.data.data,
    };
  } catch (e) {
    logger.log({
      level: 'error',
      message: e,
    });
    throw Error(constants.GONE_BAD);
  }
};
exports.verifyPayment = async (reference) => {
  try {
    const response = await axiosInstance.get(
      `/transaction/verify/${reference}`,
    );
    return {
      status: response.data.data.status,
      message: response.data.data.gateway_response,
      paymentDate: response.data.data.paidAt,
      authorization: response.data.data.authorization,
    };
  } catch (e) {
    logger.log({
      level: 'error',
      message: e,
    });
    throw Error(constants.GONE_BAD);
  }
};
