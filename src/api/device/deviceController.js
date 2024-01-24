const express = require('express');
const router = express.Router();
const deviceService = require('./deviceService');
const errorHandler = require('../../middleware/errorHandler');

const turnOnDevice = async (req, res, next) => {
    //DID를 입력 받고 해당 DID의 device를 on 시킨다.
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
    //DID를 입력 받고 해당 DID의 device를 off 시킨다.
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
    //DID와 value를 입력 받고 해당 DID의 device의 value를 설정한다.
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
    //DID와 value를 입력 받고 밝기 테스트를 해본다
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
    //test 이후에 원하는 값을 confirm했을 때 디비에 저장
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
    //DID 제공받으면 해당 값을 가지는 디비 row의 isWakeUpOn을 true로
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
    //DID 제공받으면 해당 값을 가지는 디비 row의 isWakeUpOn을 false로
    try {
        const { deviceId } = req.body;
        console.log(`deviceId: ${deviceId}`);
        const result = await deviceService.turnOffWakeUp(deviceId);
        res.status(201).json(result);
    } catch (error){
        next(error);
    }
};

router.post('/on', turnOnDevice);
router.post('/off', turnOffDevice);
router.post('/setValue', setDeviceValue);
router.get('/testWakeUpValue', testWakeUpValue);
router.post('/setWakeUpValue', setWakeUpValue);
router.post('/onWakeUp', turnOnWakeUp);
router.post('/offWakeUp', turnOffWakeUp);
router.unsubscribe(errorHandler);
module.exports = router;