const express = require('express');
const router = express.Router();
const homeService = require('./homeService');
const axios = require('axios');
const errorHandler = require('../../middleware/errorHandler');

router.use(errorHandler);

const apiKey = '10d59d5eaa8bf98b71b534f684e4b15e';
const lat = 12.97;
const lon = 77.59;
const apiUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}`;

let sunrise = null;
let sunset = null;
let isSunRise = false;


const addRoom = async (req, res, next) => {
  try {
    const { userId, roomName } = req.body;
    console.log("userId : ",userId);
    const room = await homeService.addRoom(userId, roomName);
    res.status(201).json(room);
  } catch (error) {
    next(error);
  }
};

const getRoomList = async (req, res, next) => {
  try {
    console.log("getRoomList");
    const userId = req.query.userId;
    console.log(userId);
    const rooms = await homeService.getRoomList(userId);
    res.status(200).json(rooms);
  } catch (error) {
    next(error);
  }
};

const getSunTime = async(req, res) => {
  axios.get(apiUrl)
    .then(response => {
      const weatherData = response.data;
      const sunriseTimestamp = weatherData.sys.sunrise * 1000;
      const sunsetTimestamp = weatherData.sys.sunset * 1000;

      const sunriseDate = new Date(sunriseTimestamp);
      const sunsetDate = new Date(sunsetTimestamp);

      const now = new Date();
      const options = { timeZone: 'Asia/Kolkata' };

      sunrise = sunriseDate.toLocaleString('en-US', options);
      sunset = sunsetDate.toLocaleString('en-US', options);

      if (now > sunsetDate || now < sunriseDate) {
        isSunRise = true;
      } else {
        isSunRise = false;
      }

      //when sun rise
      if (isSunRise) {
        res.json({
          "isSunRise": isSunRise,
          "time": sunrise
        });
      } else {
      //when sun set
        res.json({
          "isSunRise": isSunRise,
          "time": sunset
        });
      }
    })
    .catch(error => {
      console.error('시간 정보를 가져오는 도중 에러 발생:', error.message);
      // 에러 발생 시 에러 메시지를 JSON 형식으로 응답
      res.status(500).json({ error: error.message });
    });
};

const getSunriseTime = async(req,res)=>{
  return sunrise;
}

const getSunsetTime = async(req,res)=>{
  return sunset;
}

// URL MAPPING
router.post('/addroom', addRoom);
router.get('/getroomlist', getRoomList);
router.get('/home/sun', getSunTime);

// Error handling middleware
router.use(errorHandler);

module.exports = router;
