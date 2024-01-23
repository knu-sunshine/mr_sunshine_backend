const axios = require('axios');

const apiKey = 'YOUR_OPENWEATHERMAP_API_KEY'; // 여기에 발급받은 API 키를 입력하세요
const city = 'Seoul'; // 날씨 정보를 얻고 싶은 도시 이름

const apiUrl = `http://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}`;

axios.get(apiUrl)
  .then(response => {
    const weatherData = response.data;
    console.log('날씨 정보:', weatherData);
    // 여기에서 필요한 날씨 데이터를 가공하여 사용할 수 있습니다.
  })
  .catch(error => {
    console.error('날씨 정보를 가져오는 도중 에러 발생:', error.message);
  });
