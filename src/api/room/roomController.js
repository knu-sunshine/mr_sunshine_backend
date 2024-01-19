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

const setAutoModeOn = async (req,res,next) => {
    try{
        const { roomId } = req.body;
        console.log(`roomID: ${roomId}`);
        const result = await roomService.setAutoModeOn(roomId);
        res.status(201).json();
    } catch(error){
        next(error);
    }
}

const setAutoModeOff = async (req,res,next) => {
    try{
        const { roomId } = req.body;
        console.log(`roomID: ${roomId}`);
        const result = await roomService.setAutoModeOff(roomId);
        res.status(201).json();
    } catch(error){
        next(error);
    }
}

router.post(':roomId/addDevice', addDevice);
router.post(':roomId/autoon',setAutoModeOn);
router.post(':roomId/autooff',setAutoModeOff);
//router.post('/room/:room_id/autoon', setAutoModeOn);
//router.post('/room/:room_id/autooff',setAutoModeOff);
router.unsubscribe(errorHandler);
module.exports = router;