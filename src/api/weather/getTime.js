const express = require('express');
const router = express.Router();
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

router.get('/home/sun', (req, res) => {
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

      //일출시
      if (isSunRise) {
        res.json({
          "isSunRise": isSunRise,
          "time": sunrise
        });
      } else {
        //일몰시
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
});

module.exports = {
  sunrise,
  sunset,
  router
};
