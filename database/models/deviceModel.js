const mongoose = require('mongoose');
const userSchema = require('../schema/roomSchema');

const Device = mongoose.model('Device', deviceSchema);

module.exports = Device;