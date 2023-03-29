const Bell = require('@hapi/bell');
const AuthCookie = require('hapi-auth-cookie');
const Inert = require('@hapi/inert');
const Vision = require('@hapi/vision');
const config = require('config');
const HapiSwagger = require('hapi-swagger');
const AuthBearer = require('hapi-auth-bearer-token');
const appPackage = require('../../package.json');

module.exports = async (server) => {
  await server.register([
    Bell,
    AuthCookie,
    Inert,
    Vision,
    AuthBearer,
    {
      plugin: HapiSwagger,
      options: {
        host: process.env.SWAGGER_HOST || config.swagger.host,
        documentationPage: config.environment !== 'production',
        info: {
          title: `${appPackage.name} Documentation`,
          description: appPackage.description,
          version: appPackage.version,
        },
        basePath: '/v1/',
        grouping: 'tags',
        schemes: ['https', 'http'],
      },
    }]);
};
