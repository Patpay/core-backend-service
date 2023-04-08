/* eslint-disable no-underscore-dangle */
const { isValidObjectId } = require('mongoose');
const constants = require('../utils/constants');
const { logger } = require('../utils/logger');
const { postRequest } = require('../utils/request');

module.exports = {
  chargesService() {
    const { Charges, InflowCharge } = require('../models/index');
    return {
      async create(payload) {
        try {
          await Charges.create(payload);
          return { message: constants.SUCCESS };
        } catch (ex) {
          logger.log({
            level: 'error',
            message: ex,
          });
          return { error: constants.GONE_BAD };
        }
      },
      async getAllCharges({
        offset = 0, limit = 100, status,
      } = {}) {
        const query = {};

        if (status) {
          query.status = status;
        }

        const totalCounts = await Charges.countDocuments(query);
        const value = await Charges.find(query)
          .populate(
            'user',
            'firstname',
          )
          .skip(offset)
          .sort({ name: 1 })
          .limit(limit);
        return {
          totalCounts,
          value,
        };
      },
      async getAllInflowCharges({
        offset = 0, limit = 100, user, charge,
      } = {}) {
        const query = {};

        if (user) {
          query.user = user;
        }
        if (charge) {
          query.charge = charge;
        }
        const totalCounts = await InflowCharge.countDocuments(query);
        const value = await InflowCharge.find(query)
          .populate('charge', 'name range type')
          .skip(offset)
          .sort({ createdAt: -1 })
          .limit(limit);
        return {
          totalCounts,
          value,
        };
      },
      async calculateCharge({
        name,
        quantity,
        amount,
        user,
        // noMultiplication,
      }) {
        try {
          const query = { status: true };
          if (name) {
            query.name = name;
          }
          if (user) {
            query.user = user;
          }

          if (quantity || amount) {
            query.$and = [{ 'range.max': { $gte: (quantity || amount) } },
              { 'range.min': { $lte: (quantity || amount) } },
            ];
          }
          const response = await Charges.findOne(query);

          if (!response) {
            return { error: constants.NOT_FOUND };
          }
          let chargeAmount = 0;
          if (response.type === 'Fixed') {
            chargeAmount = response.value * (quantity || 1);
          } else {
            chargeAmount = (response.value * amount) / 100;
          }

          return {
            _id: response._id,
            amount: chargeAmount,
          };
        } catch (error) {
          logger.log({
            level: 'error',
            message: error,
          });
          return { error: constants.GONE_BAD };
        }
      },
      async createInflowCharge(payload) {
        try {
          const response = await InflowCharge.create(payload);
          return response;
        } catch (error) {
          logger.log({
            level: 'error',
            message: error,
          });
          return { error: constants.GONE_BAD };
        }
      },
      async deactivate(id) {
        try {
          if (!isValidObjectId(id)) return { error: constants.NOT_FOUND };
          const charge = await Charges.findById(id);
          if (!charge) {
            return { error: constants.NOT_FOUND };
          }
          await Charges.findOneAndUpdate(
            {
              _id: id,
            },
            { status: false },
            { new: true },
          );
          return constants.SUCCESS;
        } catch (ex) {
          logger.log({
            level: 'error',
            message: ex,
          });
          postRequest(
            'https://hooks.slack.com/services/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',
            {
              text: `${JSON.stringify(ex.message)}
            *_Service_*:  Charges
            *_Function_*: deactivate`,
            },
          );
          return { error: constants.GONE_BAD };
        }
      },
    };
  },
};
