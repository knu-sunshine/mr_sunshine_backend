const mongoose = require('mongoose');
const roomSchema = require('../schema/roomSchema');

const Room = mongoose.model('Room', roomSchema);

module.exports = Room;