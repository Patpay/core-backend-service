/* eslint-disable import/no-extraneous-dependencies */
// Importing the required modules
const sgMail = require('@sendgrid/mail');
const config = require('config');
const { logger } = require('../logger');

module.export = async function sendgridEmail(msg) {
  sgMail.setApiKey(config.sendgrid.apiKey);
  const data = {
    to: msg.to,
    from: { email: config.mail.from, name: config.sendgrid.senderName },
    templateId: msg.templateId,
    dynamicTemplateData: msg.data,
  };

  sgMail.send(data)
    .then(() => {
    }, (error) => {
      logger.error(error);
      if (error.response) {
        logger.error(error.response.body);
      }
    });
};
