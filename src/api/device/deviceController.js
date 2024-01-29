const LATITUDE= 12.9715987;
const LONGITUDE= 77.5945627;
const SUNRISE_URL= `https://api.sunrisesunset.io/json?lat=${LATITUDE}&lng=${LONGITUDE}`;
const axios = require('axios');
const momnet = require('moment');
const express = require('express');
const router = express.Router();
const deviceService = require('./deviceService');
const errorHandler = require('../../middleware/errorHandler');
const moment = require('moment');

const turnOnDevice = async (req, res, next) => {
    // Enter the DID and turn on the device of the DID
    try {
        const { deviceId } = req.body;
        console.log(`deviceId: ${deviceId}`);
        const result = await deviceService.turnOnDevice(deviceId);
        res.status(201).json(result);
    } catch (error) {
        next(error);
    }
};

const turnOffDevice = async (req, res, next) => {
    // Enter the DID and turn off the device of the DID
    try {
        const { deviceId } = req.body;
        console.log(`deviceId: ${deviceId}`);
        const result = await deviceService.turnOffDevice(deviceId);
        res.status(201).json(result);
    } catch (error) {
        next(error);
    }
};

const setDeviceValue = async (req, res, next) => {
    //Get the DID and value and set the value of the device of the corresponding DID.
    try {
        const { deviceId, value } = req.body;
        console.log(`deviceId: ${deviceId}, value: ${value}`);
        const result = await deviceService.setDeviceValue(deviceId, value);

        res.status(201).json(result);
    } catch (error) {
        next(error);
    }
};

const testWakeUpValue = async (req, res, next) => {
    //Enter DID and value and test.
    try {
        const { deviceId, value } = req.body;
        console.log(`deviceId: ${deviceId}, value: ${value}`);
        const result = await deviceService.setDeviceValue(deviceId, value);
        res.status(201).json(result);
    } catch (error){
        next(error);
    }
};

const setWakeUpValue = async (req, res, next) => {
    //Save the desired value in DB when confirmed after test
    try {
        const { deviceId, value } = req.body;
        console.log(`deviceId: ${deviceId}, value: ${value}`);
        const result = await deviceService.setWakeUpValue(deviceId, value);
        res.status(201).json(result);
    } catch (error){
        next(error);
    }
};

const turnOnWakeUp = async (req, res, next) => {
    //DID When provided, the isWakeUpOn in the DBrow with the corresponding value is true
    try {
        const { deviceId } = req.body;
        console.log(`deviceId: ${deviceId}`);
        const result = await deviceService.turnOnWakeUp(deviceId);
        res.status(201).json(result);
    } catch (error){
        next(error);
    }
};

const turnOffWakeUp = async (req, res, next) => {
    //DID When provided, the isWakeUpOn in the DBrow with the corresponding value is false
    try {
        const { deviceId } = req.body;
        console.log(`deviceId: ${deviceId}`);
        const result = await deviceService.turnOffWakeUp(deviceId);
        res.status(201).json(result);
    } catch (error){
        next(error);
    }
};


const scheduleWakeUp = (sunriseTime) => {
    const now = new Date();
    const sunrise = moment(sunriseTime, 'h:mm:ss A').toDate();
    const delay = sunrise.getTime() - now.getTime();
    console.log(`일출까지 ${delay}밀리초 남았습니다.`);
    if (delay > 0) {
        setTimeout(deviceService.wakeUp, delay);
    } else {
        console.log('오늘의 일출 시간은 이미 지났습니다.');
    }
}

deviceService.getSunriseTime().then(sunriseTime => {
    if (sunriseTime) {
        scheduleWakeUp(sunriseTime);
    }
});

router.post('/on', turnOnDevice);
router.post('/off', turnOffDevice);
router.post('/setValue', setDeviceValue);
router.get('/testWakeUpValue', testWakeUpValue);
router.post('/setWakeUpValue', setWakeUpValue);
router.post('/onWakeUp', turnOnWakeUp);
router.post('/offWakeUp', turnOffWakeUp);
router.unsubscribe(errorHandler);
module.exports = router;