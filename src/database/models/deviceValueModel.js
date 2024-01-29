const mongoose = require('mongoose');
const deviceValueSchema = require('../schemas/deviceValueSchema');

const DeviceValue = mongoose.model('DeviceValue', deviceValueSchema);

module.exports = DeviceValue;