//port info
const dotenv = require('dotenv');
dotenv.config();
const MQTT_PORT = process.env.MQTT_PORT;
const HTTP_PORT = process.env.HTTP_PORT;
const HOST = process.env.HOST;

//mqtt connection
const mqtt = require('mqtt'); 
const client = mqtt.connect(`mqtt://${HOST}:${MQTT_PORT}`) 

//make express server 
const express = require('express');
const app = express();

//check server is runnign
app.listen(HTTP_PORT, HOST, () => {
    console.log(`server is on http://${HOST}:${HTTP_PORT}`);
});

module.exports = { app,
    client
};

