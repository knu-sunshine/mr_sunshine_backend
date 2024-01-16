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
  deviceStatus:{
    type: Boolean,
    required: true,
  },
  deviceCategory: {
    type: String,
    enum: deviceCategories,
    required: true,
  },
});

module.exports = deviceSchema;
