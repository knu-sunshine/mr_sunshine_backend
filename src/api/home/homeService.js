const Room = require('../../database/models/roomModel');
const User = require('../../database/models/userModel');

//Basic Method
const findUserByUserId = async (userId) => {
  const user = await User.findOne({ userId }); // find one user using userId(not _Id in mongoDB)
  return user;
};



/**
 * API LIST
 */

/**
 * addRoom
 * 
 * @param {*} userId 
 * @param {*} roomName 
 * @returns { roomId, roomName}
 */

const addRoom = async (userId, roomName) => {
  const user = await findUserByUserId(userId);
  if (!user) {
    const error = new Error('User not found');
    error.status = 404;
    throw error;
  }

  console.log("user = ", User);

  const newRoom = new Room({
    userId,
    roomName,
    //isRoomLightOn: false, 
    //isAutoMode: false,
  });

  const savedRoom = await newRoom.save();
  await user.save();

  console.log("savedRoom = ",savedRoom);

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
