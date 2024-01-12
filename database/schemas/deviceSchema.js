const mongoose = require('mongoose');
const deviceCategories = require('../constants/deviceCategories');

const deviceSchema = new mongoose.Schema({
  deviceId: {
    type: String,
    required: true,
    unique: true,
  },
  roomId: {
    type: String,
    required: true,
    ref: 'Room', // Fk 
  },
  deviceName: {
    type: String,
    required: true,
  },
  deviceValue: {
    type: Number,
    required: true,
  },
  deviceCategory: {
    type: String,
    enum: deviceCategories,
    required: true,
  },
});

const Device = mongoose.model('Device', deviceSchema);

module.exports = Device;
