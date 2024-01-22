//port info
const dotenv = require('dotenv');
dotenv.config();
const MQTT_PORT = process.env.MQTT_PORT;
const HTTP_PORT = process.env.HTTP_PORT;
const HOST =  process.env.HOST;

//mqtt connection
const mqtt = require('mqtt'); 
const client = mqtt.connect(`mqtt://${HOST}:${MQTT_PORT}`) 
//make express server 
const express = require('express');
const app = express();
app.use(express.json())

const homeController = require('./src/api/home/homeController');
const authController = require('./src/api/auth/authController');
const roomController = require('./src/api/room/roomController');
const deviceController = require('./src/api/device/deviceController');
module.exports = { app,
    client
};

//Controller Mapping
app.use('/', homeController);
app.use('/auth',authController);
app.use('/room', roomController);
app.use('/room/device',deviceController);

//check server is running
app.listen(HTTP_PORT, HOST, () => {
    console.log(`server is on http://${HOST}:${HTTP_PORT}`);
});


