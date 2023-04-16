/* eslint-disable global-require */
/* eslint-disable max-len */
/* eslint-disable no-await-in-loop */
/* eslint-disable no-return-await */
/* eslint-disable no-underscore-dangle */
/* eslint-disable no-param-reassign */
const config = require('config');
const { isValidObjectId } = require('mongoose');
const moment = require('moment');
const constants = require('../utils/constants');
const { logger } = require('../utils/logger');
const { hashManager } = require('../utils/bcrypt');
const { sign } = require('../utils/tokenizer');
const { producer } = require('../utils/queue');
const { postRequest } = require('../utils/request');

async function getResponse(admin) {
  admin = admin.toObject();
  const option = {};
  delete admin.password;
  delete admin.token;

  return {
    admin,
    token: await sign({
      admin: admin._id,
      ...option,
      email: admin.email,
      firstname: admin.firstname,
      lastname: admin.lastname,
    }),
  };
}

async function checkIfAdminExist(admin, Admin) {
  const adminExist = await Admin.findOne({
    $or: [{ email: admin.email }, { mobile: admin.mobile }],
  });
  return adminExist;
}

module.exports = {
  adminService() {
    const {
      Admin,
    } = require('../models/index');

    return {
      async isAdmin(admin) {
        if (!isValidObjectId(admin)) return false;

        const admins = await Admin.findOne({ _id: admin, status: 'ACTIVE' });
        return admins;
      },
      async isSuperAdmin(admin) {
        if (!isValidObjectId(admin)) return false;

        const admins = await Admin.findOne({ _id: admin, role: config.migrationIDs.ADMIN_ROLE_IDS[1], status: 'ACTIVE' });
        return admins;
      },
      async signupAdmin(admin) {
        try {
          const validate = await checkIfAdminExist(admin, Admin);
          if (!validate) {
            if (!admin.password) admin.password = admin.email;
            admin.password = await hashManager().hash(admin.password);
            const newAdmin = await Admin.create(admin);
            return {
              msg: constants.SUCCESS,
              adminId: newAdmin._id,
            };
          }
          return { error: constants.DUPLICATE_USER };
        } catch (ex) {
          logger.log({
            level: 'error',
            message: ex,
          });
          postRequest('https://hooks.slack.com/services/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', {
            text: `${JSON.stringify(ex.message)}
            Service: Admin
            Function: SignUpAdmin`,
          });
          return { error: constants.GONE_BAD };
        }
      },

      //   async adminBillReconcilation(billReconId, business) {
      //     try {
      //       const billRecon = await BillPaymentReconcilation.findOne({ business, _id: billReconId });
      //       if (!billRecon) {
      //         return { error: constants.NOT_FOUND };
      //       }
      //       const bill = await billService().getById(billRecon.bill);
      //       if (billRecon.status === constants.PAYOUT_PENDING) {
      //         const reconPayload = {
      //           business: billRecon.business,
      //           user: billRecon.user,
      //           amount: bill.amount,
      //           currencyCode: 'NGN',
      //           narration: constants.ORDER_STATUS.REFUNDED,
      //         };
      //         const recon = await bankingService().creditUser(reconPayload);
      //         if (recon.error) {
      //           return recon;
      //         }
      //         await BillPaymentReconcilation.findByIdAndUpdate(billRecon._id, {
      //           status: constants.BILL_CLEARED,
      //         });
      //         return { message: constants.SUCCESS };
      //       }
      //       return { error: constants.BILLRECON_CLEARED };
      //     } catch (ex) {
      //       logger.log({
      //         level: 'error',
      //         message: ex,
      //       });
      //       postRequest('https://hooks.slack.com/services/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', {
      //         text: `${JSON.stringify(ex.message)}
      //         Service: Admin
      //         Function: businessBillReconcilation`,
      //       });
      //       return { error: constants.GONE_BAD };
      //     }
      //   },

      async signInAdmin(admin) {
        try {
          const dbAdmin = await Admin.findOne({
            $or: [
              { email: admin.adminEmailMobile },
              { mobile: admin.adminEmailMobile },
            ],
          });

          if (!dbAdmin) {
            return { error: constants.INVALID_USER };
          }
          const validatePassword = await hashManager().compare(
            admin.password,
            dbAdmin.password,
          );
          if (dbAdmin && validatePassword) {
            return await getResponse(dbAdmin);
          }
          return {
            error: constants.INVALID_USER,
          };
        } catch (error) {
          logger.log({
            level: 'error',
            message: error,
          });
          postRequest('https://hooks.slack.com/services/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', {
            text: `${JSON.stringify(error.message)}
            Service: Admin
            Function: SignInAdmin`,
          });
          throw new Error(error.message);
        }
      },

      async getAll({
        offset = 0, limit = 100,
        status,
        activated,
      } = {}) {
        // eslint-disable-next-line no-return-await
        const query = {};
        if (status) {
          query.status = status;
        }
        if (activated) {
          query.activated = activated;
        }
        const totalCounts = await Admin.countDocuments(query);
        const value = [];
        const response = await Admin.find(query)
          .skip(offset)
          .sort({ createdAt: -1 })
          .limit(limit);
        for (let index = 0; index < response.length; index += 1) {
          // eslint-disable-next-line no-await-in-loop
          value.push((await getResponse(response[index])).admin);
        }
        return {
          value,
          totalCounts,
        };
      },

      async getAdminById(adminId) {
        try {
          if (!isValidObjectId(adminId)) {
            return { error: constants.NOT_FOUND };
          }
          const admin = await Admin.findById(adminId);
          if (!admin) {
            return {
              error: constants.NOT_FOUND,
            };
          }
          return (await getResponse(admin)).admin;
        } catch (error) {
          logger.log({
            level: 'error',
            message: error,
          });
          postRequest('https://hooks.slack.com/services/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', {
            text: `${JSON.stringify(error.message)}
            Service: Admin
            Function: getAdminById`,
          });
          return { error: constants.GONE_BAD };
        }
      },

      async forgotPasswordRequest({ emailMobile }) {
        try {
          const emailMobileExist = await Admin.findOne({
            $or: [{ email: emailMobile }, { mobile: emailMobile }],
          });

          if (!emailMobileExist) {
            return { error: constants.INVALID_USER };
          }

          const token = Math.floor(Math.random() * 90000) + constants.TOKEN_RANGE;

          const updatedAdmin = await Admin.findOneAndUpdate(
            {
              email: emailMobileExist.email,
            },
            { token },
            {
              new: true,
            },
          );

          if (updatedAdmin) {
            const { email, firstname, mobile } = updatedAdmin;
            const message = `Kindly use this token: ${token} to reset your password. Mima Team`;
            producer({
              message,
              to: [mobile],
              type: constants.SMS,
            });

            producer({
              data: { firstname, token },
              type: constants.EMAIL,
              to: email,
              templateId: constants.RESET_TOKEN_TEMPLATE_ID,
            });
            return { message: constants.TOKEN_SENT };
          }
          return { error: constants.GONE_BAD };
        } catch (error) {
          logger.log({
            level: 'error',
            message: error,
          });
          postRequest('https://hooks.slack.com/services/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', {
            text: `${JSON.stringify(error.message)}
            Service: Admin
            Function: ForgotPasswordRequest`,
          });
          return { error: constants.GONE_BAD };
        }
      },

      async resetPassword({ newPassword }, adminId) {
        try {
          if (!isValidObjectId(adminId)) return { error: constants.NOT_FOUND };
          const password = await hashManager().hash(newPassword);
          const updatedAdmin = await Admin.findOneAndUpdate(
            {
              _id: adminId,
            },
            { password },
            {
              new: true,
            },
          );
          if (updatedAdmin) {
            const { email, firstname } = updatedAdmin;
            producer({
              data: { firstname },
              type: constants.EMAIL,
              to: email,
              templateId: constants.RESET_PASSWORD_SUCCESS_TEMPLATE_ID,
            });
            return { message: constants.SUCCESS };
          }
          return { error: constants.GONE_BAD };
        } catch (error) {
          logger.log({
            level: 'error',
            message: error,
          });
          postRequest('https://hooks.slack.com/services/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', {
            text: `${JSON.stringify(error.message)}
            Service: Admin
            Function: ResetPassword`,
          });
          return { error: constants.GONE_BAD };
        }
      },

      async updateAdmin(admin, adminId) {
        try {
          if (!isValidObjectId(adminId)) return { error: constants.NOT_FOUND };

          const updatedAdmin = await Admin.findOneAndUpdate(
            {
              _id: adminId, status: 'ACTIVE',
            },
            admin,
            {
              new: true,
            },
          );
          return {
            adminId: updatedAdmin._id,
            message: constants.SUCCESS,
          };
        } catch (error) {
          logger.log({
            level: 'error',
            message: error,
          });
          postRequest('https://hooks.slack.com/services/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', {
            text: `${JSON.stringify(error.message)}
            Service: Admin
            Function: updateAdmin`,
          });
          return { error: constants.GONE_BAD };
        }
      },

      async deleteAdmin(adminId, password) {
        try {
          if (!isValidObjectId(adminId)) {
            return { error: constants.NOT_FOUND };
          }
          const admin = await Admin.findById(adminId);
          if (!admin) {
            return { error: constants.INVALID_ADMIN };
          }
          const validatePassword = await hashManager().compare(
            password,
            admin.password,
          );
          if (validatePassword) {
            const updatedAdmin = await Admin.findOneAndUpdate(
              {
                _id: adminId,
              },
              { status: 'INACTIVE', activated: false },
              { new: true },
            );
            if (updatedAdmin) {
              return { response: constants.SUCCESS };
            }
          }
          return { error: constants.INVALID_ADMIN };
        } catch (ex) {
          logger.log({
            level: 'error',
            message: ex,
          });
          postRequest('https://hooks.slack.com/services/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', {
            text: `${JSON.stringify(ex.message)}
            Service: Admin
            Function: deleteAdmin`,
          });
          throw new Error(ex.message);
        }
      },

      async changePassword(adminId, password, newPassword) {
        try {
          if (!isValidObjectId(adminId)) {
            return { error: constants.NOT_FOUND };
          }
          newPassword = await hashManager().hash(newPassword);
          const admin = await Admin.findById(adminId);
          const validatePassword = await hashManager().compare(
            password,
            admin.password,
          );
          if (validatePassword) {
            const updatedAdmin = await Admin.findOneAndUpdate(
              {
                _id: adminId,
              },
              { password: newPassword },
              {
                new: true,
              },
            );
            if (updatedAdmin) {
              const { email, firstname } = admin;
              producer({
                data: { firstname },
                type: constants.EMAIL,
                to: email,
                templateId: constants.PASSWORD_CHANGE_SUCCESS_TEMPLATE_ID,
              });
              return { response: constants.SUCCESS };
            }
          }
          return { error: 'CURRENT PASSWORD NOT VALID' };
        } catch (error) {
          logger.log({
            level: 'error',
            message: error,
          });
          postRequest('https://hooks.slack.com/services/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', {
            text: `${JSON.stringify(error.message)}
            Service: Admin
            Function: changePassword`,
          });
          return { error: constants.GONE_BAD };
        }
      },

      async validateForgottenPasswordAdmin({ emailMobile, token }) {
        try {
          const admin = await Admin.findOne({
            $or: [{ email: emailMobile }, { mobile: emailMobile }],
            token,
          });
          if (!admin) return { error: constants.GONE_BAD };
          return (await getResponse(admin));
        } catch (error) {
          logger.log({
            level: 'error',
            message: error,
          });
          postRequest('https://hooks.slack.com/services/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', {
            text: `${JSON.stringify(error.message)}
            Service: Admin
            Function: validateForgottenPasswordAdmin`,
          });
          return { error: constants.GONE_BAD };
        }
      },

    };
  },

};
