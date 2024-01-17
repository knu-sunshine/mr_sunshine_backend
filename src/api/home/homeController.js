const express = require('express');
const router = express.Router();
const homeService = require('./homeService');

const addRoom = async (req, res, next) => {
  try {
    const { userId, roomName } = req.body;
    const result = await homeService.createRoom(userId, roomName);
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

const getSunriseTime = (req, res) => {
  // 여기에 일출 시간을 얻는 기능 추가
  // 어떻게 얻을지에 따라 구현이 달라질 수 있습니다.
  res.status(200).json({ sunriseTime: '07:00 AM' });
};

const getSunsetTime = (req, res) => {
  // 여기에 일몰 시간을 얻는 기능 추가
  // 어떻게 얻을지에 따라 구현이 달라질 수 있습니다.
  res.status(200).json({ sunsetTime: '06:00 PM' });
};

router.post('/addRoom', addRoom);
router.get('/', getRoomList);
router.get('/getSunriseTime', getSunriseTime);
router.get('/getSunsetTime', getSunsetTime);

module.exports = router;
