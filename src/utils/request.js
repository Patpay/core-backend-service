const axios = require('axios');
const configs = require('config');
const FormData = require('form-data');
const { logger } = require('./logger');

let response;

async function getRequest(url, headers) {
  try {
    response = await axios.get(url, { timeout: 180000, headers });
    return { statusCode: response.status, data: response.data };
  } catch (err) {
    logger.error(err);
    return { statusCode: err.response.status, data: err.response.data };
  }
}

async function postRequest(url, data, headers) {
  try {
    const domain = (new URL(url));
    if (domain.hostname === 'hooks.slack.com' && configs.environment !== 'production') { return { }; }
    response = await axios.post(url, data, {
      headers,
      timeout: 180000,
    });
    return { statusCode: response.status, data: response.data };
  } catch (err) {
    return { statusCode: err.response.status, data: err.response.data };
  }
}

async function postFormDataRequest(url, data, headers) {
  try {
    const form = new FormData();
    data.forEach((payload) => {
      form.append(payload[0], payload[1]);
    });
    const config = {
      method: 'POST',
      url,
      headers: {
        ...headers,
        ...form.getHeaders(),
      },
      data: form,
    };

    response = await axios(config);
    return { statusCode: response.status, data: response.data };
  } catch (err) {
    logger.error(err);
    return { statusCode: err.response.status, data: err.response.data };
  }
}

module.exports = {
  getRequest,
  postRequest,
  postFormDataRequest,
};
