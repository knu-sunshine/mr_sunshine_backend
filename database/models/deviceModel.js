const mongoose = require('mongoose');
const deviceSchema = require('../schemas/deviceSchema');

const Device = mongoose.model('Device', deviceSchema);

module.exports = Device;