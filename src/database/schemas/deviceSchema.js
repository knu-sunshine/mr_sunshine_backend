const mongoose = require('../connect')
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
    type: Number,
    required: true,
    min:0,
    max:100,
  },
  deviceCategory: {
    type: String,
    enum: deviceCategories,
    required: true,
  },
  isdeviceOn:{
    type:Boolean,
    required:false,
  },
  isWakeUpOn: {
    type: Boolean,
    default: false,
    required: false,
  },
  wakeUpValue:{
    type: Number,
    required: false,
    min: 0,
    max: 100
  }
});

module.exports = deviceSchema;
