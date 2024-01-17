const mongoose = require('mongoose');
const deviceValueSchema = require('../schemas/deviceValueSchema');

const DeviceValue = mongoose.model('Device', deviceValueSchema);

module.exports = DeviceValue;