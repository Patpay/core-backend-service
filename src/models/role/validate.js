const mongoose = require('mongoose');

async function validateRole(val) {
  const Role = mongoose.model('Role');
  try {
    const prole = await Role.findById(val).lean().exec();
    return Boolean(prole);
  } catch (ex) {
    return false;
  }
}

module.exports = {
  validateRole,
};
