const mongoose = require('mongoose');

const deviceValueSchema = new mongoose.Schema({
    deviceValueId: {
      type: String,
      required: true,
      unique: true,
    },
    deviceId: { 
      type: mongoose.Schema.Types.ObjectId,
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