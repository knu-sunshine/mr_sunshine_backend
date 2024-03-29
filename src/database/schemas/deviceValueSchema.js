const mongoose = require('../connect');
const { v4: uuidv4 } = require('uuid');

const deviceValueSchema = new mongoose.Schema({
    deviceValueId: {
      type: String,
      default: uuidv4,
      required: true,
      unique: true,
    },
    deviceId: { 
      type: String,
      ref: 'Device',
    },
    value: {
      type: Number,
      required: true,
      min: 0,
      max: 100
    },
    updateDate: {
         type: Date, 
         default: Date.now 
    },
  });

module.exports = deviceValueSchema;