
// const mqtt = require('mqtt'); //import mqtt package
// const MQTT_PORT = 1883 //broker's port num
// const publisher = mqtt.connect(`mqtt://${HOST}:${MQTT_PORT}`) //publsiher connection
// const subscriber = mqtt.connect(`mqtt://${HOST}:${MQTT_PORT}`) //subscriber connection


const express = require('express');
const app = express();
const HTTP_PORT = process.env.HTTP_PORT;
const HOST = process.env.HOST;

app.listen(HTTP_PORT, HOST, () => {
    console.log(`서버가 http://${HOST}:${HTTP_PORT} 에서 실행 중입니다.`);
});