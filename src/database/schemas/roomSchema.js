const mongoose = require('../connect');
const { v4: uuidv4 } = require('uuid'); // uuid 패키지에서 v4 함수를 가져옴

const roomSchema = new mongoose.Schema({
    roomId: {
      type: String,
      default: uuidv4,
      required: true,
      unique: true,
    },
    userId: {
        type: String,
        required: true,
        ref: 'User', //FK
    },
    roomName: {
      type: String,
      required: true,
    },
    isRoomLightOn: {
      type: Boolean,
      default: false,
    },
    isAutoMode: {
      type: Boolean,
      default: false,
    },
    lightValue: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
      default:0
    }
  });

module.exports = roomSchema;