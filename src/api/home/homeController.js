const express = require('express');
const router = express.Router();
const homeService = require('./homeService');
const axios = require('axios');
const SUNRISE_URL = new URL(`https://65b871d446324d531d563756.mockapi.io/device/getSunriseTime/sunrise`);
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


      res.status(200).json({sunrise,sunset})
    })
    .catch(error => {
      console.error('시간 정보를 가져오는 도중 에러 발생:', error.message);
      // 에러 발생 시 에러 메시지를 JSON 형식으로 응답
      res.status(500).json({ error: error.message });
    });
};

const getSunriseTime = async (req, res) => {
  try {
      const response = await fetch(SUNRISE_URL, {
          method: 'GET',
          headers: { 'content-type': 'application/json' },
      }).then(res => {
          if (res.ok) {
              return res.json();
          }
      });
      console.log(response);
      let sunrise = response[0].sunrise;
      let sunset = response[1].sunrise;
      console.log(sunrise, sunset);
      res.status(200).json({sunrise, sunset});
  } catch (error) {
      console.error('일출 시간 조회 중 오류:', error);
      throw error;
  }
};

// const getSunriseTime = async(req,res)=>{
//   return sunrise;
// }

const getSunsetTime = async(req,res)=>{
  return sunset;
}

// URL MAPPING
router.post('/addroom', addRoom);
router.get('/getroomlist', getRoomList);
router.get('/sun', getSunriseTime);

// Error handling middleware
router.use(errorHandler);

module.exports = router;
