const express = require('express');
const router = express.Router();
const Device = require('../../database/models/deviceModel');

/**
 * 
 * Basic Method
 */
const getDeviceByDeviceId = async(deviceId) => {
    try{
        const device = await Device.findOne({deviceId});
        return device;
    }catch(error) {
        console.error(`Error finding user: ${error.message}`);
        throw error;
    }
}

/**
 * Main API
 */


/**
 * 
 * @param {*} deviceId 
 * @param {*} value 
 */
const setWakeUpValue = async(deviceId, value)=>{
    let device = await getDeviceByDeviceId(deviceId);
    device.wakeUpValue = value;
    return device;
}

module.exports = {
    setWakeUpValue
};