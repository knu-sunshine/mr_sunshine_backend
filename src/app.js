
// const mqtt = require('mqtt'); //import mqtt package
// const MQTT_PORT = 1883 //broker's port num
// const publisher = mqtt.connect(`mqtt://${HOST}:${MQTT_PORT}`) //publsiher connection
// const subscriber = mqtt.connect(`mqtt://${HOST}:${MQTT_PORT}`) //subscriber connection

const HOST = "192.168.203.116" //chan's ip 
const HTTP_PORT = 3000
const express = require('express');
const app = express();

app.listen(HTTP_PORT, HOST, () => {
    console.log(`서버가 http://${HOST}:${HTTP_PORT} 에서 실행 중입니다.`);
});