const mongoose = require('mongoose');

async function validateAdmin(val) {
  const Admin = mongoose.model('Admin');
  try {
    const admin = await Admin.findById(val).lean().exec();
    return Boolean(admin);
  } catch (ex) {
    return false;
  }
}

module.exports = {
    validateAdmin,
};
