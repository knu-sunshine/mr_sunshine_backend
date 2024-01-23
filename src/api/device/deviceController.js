const express = require('express');
const router = express.Router();
const deviceService = require('./deviceService');
const errorHandler = require('../../middleware/errorHandler');


const setWakeUpValue = async (req, res, next) => {
    try {
        const { deviceId, value} = req.body;
        console.log(`deviceId: ${deviceId} , value: ${value}`);
        const result = await deviceService.setWakeUpValue(deviceId,value);
        res.status(201).json(result);
    } catch (error) {
        next(error);
    }
};

router.post('/setwv',setWakeUpValue);
module.exports = router;