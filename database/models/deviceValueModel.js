const mongoose = require('mongoose');
const deviceValueSchema = require('../schema/deviceValueSchema');

const DeviceValue = mongoose.model('Device', deviceValueSchema);

module.exports = DeviceValue;