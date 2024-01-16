const mongoose = require('mongoose');
const deviceSchema = require('../schema/deviceSchema');

const Device = mongoose.model('Device', deviceSchema);

module.exports = Device;