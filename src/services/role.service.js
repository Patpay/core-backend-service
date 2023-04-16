/* eslint-disable global-require */
/* eslint-disable no-param-reassign */
/* eslint-disable no-return-await */
const { isValidObjectId } = require('mongoose');
const constants = require('../utils/constants');
const { logger } = require('../utils/logger');
const { postRequest } = require('../utils/request');

module.exports = {
  roleService() {
    const { Role } = require('../models/index');
    return {
      async create(payload) {
        try {
          const role = await Role.findOne({ name: payload.name });
          if (role) {
            return {
              error: constants.EXIST,
            };
          }
          await Role.create(payload);
          return { message: constants.SUCCESS };
        } catch (ex) {
          logger.log({
            level: 'error',
            message: ex,
          });
          postRequest('https://hooks.slack.com/services/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', {
            text: `${JSON.stringify(ex.message)}
            *_Service_*:  roles
            *_Function_*: create`
          })
          return { error: constants.GONE_BAD };
        }
      },
      async getAll({
        offset = 0,
        limit = 100,
        status = true,
      } = {}) {
        const totalCounts = await Role.countDocuments({ status });
        const value = await Role.find({ status })
          .skip(offset)
          .sort({ createdAt: -1 })
          .limit(limit);
        return {
          value,
          totalCounts,
        };
      },
      async getById(id) {
        if (!isValidObjectId(id)) return { error: constants.NOT_FOUND };
        const role = await Role.findById(id);
        if (!role) return { error: constants.NOT_FOUND };
        return role;
      },
      async update(payload, id) {
        try {
          if (!isValidObjectId(id)) return { error: constants.NOT_FOUND };
          const role = await Role.findOneAndUpdate({
            _id: id,
          }, payload, {
            new: true,
          });
          if (!role) return { error: constants.NOT_FOUND };
          return role;
        } catch (error) {
          logger.log({
            level: 'error',
            message: error,
          });
          postRequest('https://hooks.slack.com/services/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', {
            text: `${JSON.stringify(error.message)}
            *_Service_*:  roles
            *_Function_*: update`
          })
          return { error: constants.GONE_BAD };
        }
      },
      // eslint-disable-next-line consistent-return
      async deactivate(roleId) {
        try {
          if (!isValidObjectId(roleId)) return { error: constants.NOT_FOUND };
          const role = await Role.findById(roleId);

          if (!role) {
            return { error: constants.NOT_FOUND };
          }
          await Role.findOneAndUpdate({
            _id: roleId,
          },
          { status: false },
          { new: true });
          return constants.SUCCESS;
        } catch (ex) {
          logger.log({
            level: 'error',
            message: ex,
          });
          postRequest('https://hooks.slack.com/services/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', {
            text: `${JSON.stringify(ex.message)}
            *_Service_*:  roles
            *_Function_*: deactivate`
          })
          throw new Error(ex.message);
        }
      },
    };
  },
};
