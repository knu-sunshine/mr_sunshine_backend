const Room = require('../models/roomModel');
const User = require('../models/userModel');

const addRoom = async (userId, roomName) => {
  const user = await User.findById(userId);
  if (!user) {
    const error = new Error('User not found');
    error.status = 404;
    throw error;
  }

  const newRoom = new Room({
    userId,
    roomName,
    isRoomLightOn: false,
    isAutoMode: false,
  });

  const savedRoom = await newRoom.save();
  user.rooms.push(savedRoom._id);
  await user.save();

  return {
    roomId: savedRoom._id,
    roomName: savedRoom.roomName,
  };
};

const getRoomList = async () => {
  return await Room.find();
};

module.exports = {
  addRoom,
  getRoomList,
};
