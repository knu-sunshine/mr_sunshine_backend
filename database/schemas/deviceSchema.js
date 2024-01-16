const mongoose = require('mongoose');
const deviceCategories = require('../constants/deviceCategories');
const { v4: uuidv4 } = require('uuid');

const deviceSchema = new mongoose.Schema({
  deviceId: {
    type: String,
    default: uuidv4,
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
  isdeviceOn:{
    type:Boolean,
    required:false,
  }
});

module.exports = deviceSchema;
