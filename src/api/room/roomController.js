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

router.post('/:room_id/addDevice', addDevice)
router.post('/:room_id/setRoonLightOn', setRoomLightOn);
//router.get('/:room_id/getDeviceList', getDeviceList);
//router.post('/room/:room_id/autoon', setAutoModeOn);
//router.post('/room/:room_id/autooff',setAutoModeOff);
router.unsubscribe(errorHandler);
module.exports = router;