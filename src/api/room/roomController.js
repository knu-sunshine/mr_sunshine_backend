const express = require('express');
const router = express.Router();
const roomService = require('./roomService');
const errorHandler = require('../../middleware/errorHandler');

const addDevice = async (req, res, next) => {
    //request를 받아온다
    try {
        const { roomId, deviceId, deviceName } = req.body;
        console.log(`roomID: ${roomId}, deviceID: ${deviceId}, deviceName: ${deviceName}`);
        const result = await roomService.addDevice(roomId, deviceId, deviceName);
        res.status(201).json(result);
    } catch (error) {
        next(error);
    }
};

const setRoomLightOn = async (req, res, next) => {
    try {
        const { roomId, deviceId } = req.body;
        console.log(`roomID: ${roomId}, deviceID: ${deviceId}`);
        const result = await roomService.setRoomLightOn(roomId, deviceId);
        res.status(201).json(result);
    } catch (error) {
        next(error);
    }
};

const setRoomLightOff = async (req, res, next) => {
    try {
        const { roomId, deviceId } = req.body;
        console.log(`roomID: ${roomId}, deviceID: ${deviceId}`);
        const result = await roomService.setRoomLightOff(roomId, deviceId);
        res.status(201).json(result);
    } catch (error) {
        next(error);
    }
};

const getDeviceList = async (req, res, next) => {
    try {
        const roomId = req.body;
        console.log(`roomID: ${roomId}`);
        const result = await roomService.getDeviceList(roomId);
        res.status(201).json(result);
    } catch (error) {
        next(error);
    }
};

router.post('/addDevice', addDevice)
router.post('/lightOn', setRoomLightOn);
router.post('/lightOff', setRoomLightOff);
router.get('/getDeviceList', getDeviceList);
//router.post('/room/:room_id/autoon', setAutoModeOn);
//router.post('/room/:room_id/autooff',setAutoModeOff);
router.unsubscribe(errorHandler);
module.exports = router;