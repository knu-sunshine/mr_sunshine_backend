const express = require('express');
const router = express.Router();
const homeService = require('./homeService');
const errorHandler = require('../../middleware/errorHandler');

const addRoom = async (req, res, next) => {
  try {
    const { userId, roomName } = req.body;
    console.log("userId : ",userId);
    const result = await homeService.addRoom(userId, roomName);
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
};

const getRoomList = async (req, res, next) => {
  try {
    const rooms = await homeService.getRoomList();
    res.status(200).json(rooms);
  } catch (error) {
    next(error);
  }
};

const getSunriseTime = async(req, res, next) => {
  try {
    const sunriseTime =await homeService.getSunriseTime();
    res.status(200).json(sunriseTime);
    console.log("일출시간 : ",sunriseTime);
  } catch (error) {
    next(error);
  }
};

const getSunsetTime = async(req, res, next) => {
  // 여기에 일몰 시간을 얻는 기능 추가
  // 어떻게 얻을지에 따라 구현이 달라질 수 있습니다.
  try {
    const sunsetTime =await homeService.getSunsetTime();
    res.status(200).json(sunsetTime);
    console.log("일몰시간 : ",sunsetTime);
  } catch (error) {
    next(error);
  }
};

// URL MAPPING
router.post('/addroom', addRoom);
router.get('/', getRoomList);
router.get('/getsunrisetime', getSunriseTime);
router.get('/getsunsettime', getSunsetTime);

// Error handling middleware
router.use(errorHandler);

module.exports = router;
