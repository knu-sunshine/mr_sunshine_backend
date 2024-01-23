const express = require('express');
const router = express.Router();
const deviceService = require('./deviceService');
const errorHandler = require('../../middleware/errorHandler');

const turnOnDevice = async (req, res, next) => {
    //DID를 입력 받고 해당 DID의 device를 on 시킨다.
};

const turnOffDevice = async (req, res, next) => {
    //DID를 입력 받고 해당 DID의 device를 off 시킨다.
};

const setDeviceValue = async (req, res, next) => {
    //DID를 입력 받고 해당 DID의 device의 value를 설정한다.
};

const setWakeUpValue = async (req, res, next) => {
    try {
        const { deviceId, value} = req.body;
        console.log(`deviceId: ${deviceId} , value: ${value}`);
        const result = await roomService.setWakeUpValue(deviceId,value);
        res.status(201).json(result);
    } catch (error) {
        next(error);
    }
};

router.post('/on', turnOnDevice);
router.post('/off', turnOffDevice);
router.post('/setValue', setDeviceValue);
router.post('/setWakeUpValue',setWakeUpValue);
module.exports = router;