const mongoose = require('connect')

const roomSchema = new mongoose.Schema({
    roomId: {
      type: String,
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
    }
  });

module.exports = roomSchema;