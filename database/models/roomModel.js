const mongoose = require('mongoose');
const roomSchema = require('../schemas/roomSchema');

const Room = mongoose.model('Room', roomSchema);

module.exports = Room;