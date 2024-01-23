const express = require('express');
const router = express.Router();

const Room = require('../../database/models/roomModel');
const User = require('../../database/models/userModel');
const errorHandler = require('../../middleware/errorHandler');

//Basic Method
const findUserByUserId = async (userId,next) => {
  try{
    const user = await User.findOne({ userId }); // find one user using userId(not _Id in mongoDB)
    return user;
  }catch(error){
    next(error);
  }  
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
    throw error;
  }

  console.log("user = ", user);

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
    roomId: savedRoom.roomId,
    roomName: savedRoom.roomName,
  };
};


/**
 * getRoomList
 * @returns Room
 */

const getRoomList = async (userId) => {
  const user = await findUserByUserId(userId);
  return user;
};

/**
 * getSunriseTime
 * @returns sunriseTime (Type : Date)
 */

const getSunriseTime = async () => {
  const sunriseTime = Date.now();
  return sunriseTime;
};

/**
 * getRoomList
 * @returns sunsetTime (Type : Date)
 */

const getSunsetTime = async () => {
  const sunsetTime = Date.now();
  return sunsetTime;
};



module.exports = {
  addRoom,
  getRoomList,
  getSunriseTime,
  getSunsetTime,
};
