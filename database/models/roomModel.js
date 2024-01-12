const mongoose = require('mongoose');
const userSchema = require('../schema/roomSchema');

const Room = mongoose.model('Room', roomSchema);

module.exports = Room;