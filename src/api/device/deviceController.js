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
        console.log(`deviceId: ${deviceId}`);
        const result = await deviceService.setDeviceValue(deviceId, value);
        res.status(201).json(result);
    } catch (error) {
        next(error);
    }
};

router.post('/on', turnOnDevice);
router.post('/off', turnOffDevice);
router.post('/setValue', setDeviceValue);
router.unsubscribe(errorHandler);
module.exports = router;