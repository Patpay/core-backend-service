const Joi = require('joi');
const namespace = require('hapijs-namespace');
const { usersController } = require('../controllers');

module.exports = (server, prefix) => {
  namespace(server, prefix, [
    {
      method: 'Post',
      path: '/sign-up',
      config: {
        description: 'sign up',
        tags: ['api', 'user'],
        validate: {
          payload: Joi.object({
            email: Joi.string()
              .required()
              .email()
              .trim()
              .prefs({ convert: true }),
            password: Joi.string().required(),
            mobile: Joi.string().required(),
            fullName: Joi.string().required(),
            pin: Joi.string().required(),
          }),
        },
        handler: usersController.signUpUser,
      },
    },
    {
      method: 'Post',
      path: '/signin',
      config: {
        description: 'sign up',
        tags: ['api', 'user'],
        validate: {
          payload: Joi.object({
            email: Joi.string()
              .required()
              .email()
              .trim()
              .prefs({ convert: true }),
            password: Joi.string().required(),
          }),
        },
        handler: usersController.signInUser,
      },
    },
  ]);
};
