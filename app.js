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
app.use(express.json())

const homeController = require('./src/api/home/homeController');
const authController = require('./src/api/auth/authController');
module.exports = { app,
    client
};

const homeController = require('./src/api/home/homeController');
const roomController = require('./src/api/room/roomController');
//Controller Mapping
app.use('/', homeController);
app.use('/auth',authController);
app.use('/', roomController);

//check server is running
app.listen(HTTP_PORT, HOST, () => {
    console.log(`server is on http://${HOST}:${HTTP_PORT}`);
});


