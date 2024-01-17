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

const getSunriseTime = (req, res, next) => {
  // 여기에 일출 시간을 얻는 기능 추가
  // 어떻게 얻을지에 따라 구현이 달라질 수 있습니다.
  try {
    res.status(200).json({ sunriseTime: '07:00 AM' });
  } catch (error) {
    next(error);
  }
};

const getSunsetTime = (req, res, next) => {
  // 여기에 일몰 시간을 얻는 기능 추가
  // 어떻게 얻을지에 따라 구현이 달라질 수 있습니다.
  try {
    res.status(200).json({ sunsetTime: '06:00 PM' });
  } catch (error) {
    next(error);
  }
};

// URL MAPPING
router.post('/addroom', addRoom);
router.get('/', getRoomList);
router.get('/getsunrisetime', getSunriseTime);
router.get('/gesSunsettime', getSunsetTime);

// Error handling middleware
router.use(errorHandler);

module.exports = router;
