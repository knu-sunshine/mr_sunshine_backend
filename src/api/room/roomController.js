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

const setRoomOn = async (req, res, next) => {
    try {
        const { roomId } = req.body;
        console.log(`roomID: ${roomId}`);
        const result = await roomService.setRoomOn(roomId);
        res.status(201).json(result);
    } catch (error) {
        next(error);
    }
};

const setRoomOff = async (req, res, next) => {
    try {
        const { roomId } = req.body;
        console.log(`roomID: ${roomId}`);
        const result = await roomService.setRoomOff(roomId);
        res.status(201).json(result);
    } catch (error) {
        next(error);
    }
};

const getDeviceList = async (req, res, next) => {
    try {
        const { roomId } = req.body;
        console.log(`roomID: ${roomId}`);
        const result = await roomService.getDeviceList(roomId);
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
        const { roomId }  = req.body;
        console.log(`roomID: ${roomId}`);
        const result = await roomService.setAutoModeOff(roomId);
        res.status(201).json();
    } catch(error){
        next(error);
    }
}

router.post('/addDevice', addDevice);
router.post('/autoOn',setAutoModeOn);
router.post('/autoOff',setAutoModeOff);
router.post('/on', setRoomOn);
router.post('/off', setRoomOff);
router.get('/getDeviceList', getDeviceList);
router.unsubscribe(errorHandler);
module.exports = router;