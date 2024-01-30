const LATITUDE = 12.9715987;
const LONGITUDE = 77.5945627;
//const SUNRISE_URL = `https://api.sunrisesunset.io/json?lat=${LATITUDE}&lng=${LONGITUDE}`;
const SUNRISE_URL = new URL(`https://65b871d446324d531d563756.mockapi.io/device/getSunriseTime/sunrise`);
const axios = require('axios');
const Device = require('../../database/models/deviceModel');
const DeviceValue = require('../../database/models/deviceValueModel');
const checkDevice = require('../common/checkDevice');
const controlDeviceValue = require('../common/controlDeviceValue');

const checkDID = (DID) => {
    if (DID.length === 4 && (DID[0] === 'L' || DID[0] === 'C')) {
        return true;
    }
    return false;
};

const checkDB_device = (DID) => {
    try {
        const device = Device.findOne({ deviceId: DID });
        // row가 존재하면 true, 그렇지 않으면 false 반환
        return device != null;
    } catch (error) {
        console.error('checkDB_device, DB 조회 중 오류 발생:', error);
        return false; // 오류 발생 시 false 반환
    }
};

const checkDB_deviceValue = (DID) => {
    try {
        const deviceValue = DeviceValue.findOne({ deviceId: DID });
        // row가 존재하면 true, 그렇지 않으면 false 반환
        return deviceValue != null;
    } catch (error) {
        console.error('checkDB_deviceValue, DB 조회 중 오류 발생:', error);
        return false; // 오류 발생 시 false 반환
    }
};

const findCurrentValue = async (DID) => {
    try {
        // MongoDB에서 해당 DID의 최신 value 찾기 (updateDate 내림차순으로 정렬)
        const currentValue = await DeviceValue.findOne({ deviceId: DID })
            .sort({ updateDate: -1 })
            .select('value');
        //console.log(currentValue.value);
        return currentValue.value;
    } catch (error) {
        console.error('장치 검색 중 오류 발생:', error);
        return null; // 오류 발생 시 빈 리스트 반환
    }
};

const insertDeviceValue = async (DID, value) => {
    try {
        const valueInfo = [
            {
                deviceId: DID,
                value: value
            }
        ];
        await DeviceValue.insertMany(valueInfo);
        console.log("On deviceValue model, data seeded successfully");
    } catch (error) {
        console.error("Error seeding deviceValue database:", error);
    }
};

const updateDevice = async (DID, value) => {
    try {
        const device = await Device.findOne({ deviceId: DID });
        if (device) {
            device.deviceStatus = value;
            device.isdeviceOn = value === 0 ? false : true;
            await device.save();
        } else {
            console.log(`Device not found for deviceId: ${DID}`);
        }
    } catch (error) {
        console.error(`Error updating device status: ${error}`);
        throw error;
    }
};

const changeDeviceDB = async (DID, value) => {
    try {
        const device = await Device.findOneAndUpdate(
            { deviceId: DID },
            { $set: { WakeUpValue: value, isWakeUpOn: true } },
            { new: true }
        );
        console.log(`Device with DID ${DID} updated successfully`);
        return device;
    } catch (error) {
        console.error(`Error updating device with DID ${DID}:`, error);
        throw error;
    }
}

const turnOnDevice = async (deviceId) => {
    let statusOfDID = checkDID(deviceId); //Check DID is valid
    let statusOfDB_device = checkDB_device(deviceId); //Check DB_device has the DID
    let statusOfDB_deviceValue = checkDB_deviceValue(deviceId); //Check DB_deviceValue has the DID

    if (statusOfDID && statusOfDB_device && statusOfDB_deviceValue) {
        let currentValue = await findCurrentValue(deviceId); //Finc currenValue of the DID
        if (await controlDeviceValue(deviceId, currentValue, 100)) { //Turn on
            await insertDeviceValue(deviceId, 100);
            await updateDevice(deviceId, 100);
        } else {
            console.log(`network error with IoT`)
            const error = new Error('network error with IoT');
            error.status = 404;
            throw error;
        }
    } else {
        console.log(`DID is not valid : ${statusOfDID}, DB_device : ${statusOfDB_device}, DB_deviceValue : ${statusOfDB_deviceValue}`);
        const error = new Error('DID | DB has error');
        error.status = 404;
        throw error
    }
    return {
        result: "success"
    };
};

const turnOffDevice = async (deviceId) => {
    let statusOfDID = checkDID(deviceId); //Check DID is valid
    let statusOfDB_device = checkDB_device(deviceId); //Check DB_device has the DID
    let statusOfDB_deviceValue = checkDB_deviceValue(deviceId); //Check DB_deviceValue has the DID

    if (statusOfDID && statusOfDB_device && statusOfDB_deviceValue) {
        let currentValue = await findCurrentValue(deviceId); //Find currenValue of the DID
        if (await controlDeviceValue(deviceId, currentValue, 0)) { //Turn off
            await insertDeviceValue(deviceId, 0);
            await updateDevice(deviceId, 0);
        } else {
            console.log(`network error with IoT`)
            const error = new Error('network error with IoT');
            error.status = 404;
            throw error;
        }
    } else {
        console.log(`DID is not valid : ${statusOfDID}, DB_device : ${statusOfDB_device}, DB_deviceValue : ${statusOfDB_deviceValue}`);
        const error = new Error('DID | DB has error');
        error.status = 404;
        throw error
    }
    return {
        result: "success"
    };
};

const setDeviceValue = async (deviceId, value) => {
    let statusOfDID = checkDID(deviceId); //Check DID is valid
    let statusOfDB_device = checkDB_device(deviceId); //Check DB_device has the DID
    let statusOfDB_deviceValue = checkDB_deviceValue(deviceId); //Check DB_deviceValue has the DID

    if (statusOfDID && statusOfDB_device && statusOfDB_deviceValue) {
        let currentValue = await findCurrentValue(deviceId); //Find currenValue of the DID
        if (await controlDeviceValue(deviceId, currentValue, value)) { //Set value
            await insertDeviceValue(deviceId, value);
            await updateDevice(deviceId, value);
        } else {
            console.log(`network error with IoT`)
            const error = new Error('network error with IoT');
            error.status = 404;
            throw error;
        }
    } else {
        console.log(`DID is not valid : ${statusOfDID}, DB_device : ${statusOfDB_device}, DB_deviceValue : ${statusOfDB_deviceValue}`);
        const error = new Error('DID | DB has error');
        error.status = 404;
        throw error
    }
    return {
        result: "success"
    };
};

const testWakeUpValue = async (deviceId, value) => {
    let statusOfDID = checkDID(deviceId); //Check DID is valid
    let statusOfDB_device = checkDB_device(deviceId); //Check DB_device has the DID
    let statusOfDB_deviceValue = checkDB_deviceValue(deviceId); //Check DB_deviceValue has the DID

    if (statusOfDID && statusOfDB_device && statusOfDB_deviceValue) {
        let currentValue = await findCurrentValue(deviceId); //Find currenValue of the DID
        if (await controlDeviceValue(deviceId, currentValue, value)) {
            console.log('testWakeUpValue success');
            setTimeout(() => {controlDeviceValue(deviceId, value, currentValue)}, 5000);
        } else {
            console.log(`network error with IoT`)
            const error = new Error('network error with IoT');
            error.status = 404;
            throw error;
        }
    } else {
        console.log(`DID is not valid : ${statusOfDID}, DB_device : ${statusOfDB_device}, DB_deviceValue : ${statusOfDB_deviceValue}`);
        const error = new Error('DID | DB has error');
        error.status = 404;
        throw error
    }
    return {
        result: "success"
    };
};



const setWakeUpValue = async (deviceId, value) => {
    let statusOfDID = checkDID(deviceId);
    let statusOfDB_device = checkDB_device(deviceId);
    let statusOfDB_deviceValue = checkDB_deviceValue(deviceId);

    if (statusOfDID && statusOfDB_device && statusOfDB_deviceValue) {
        try {
            const device = await Device.findOneAndUpdate( //Update device fo func wakeUp
                { deviceId: deviceId },
                { $set: { wakeUpValue: value, isWakeUpOn: true } },
                { new: true }
            );
            console.log(`Device with DID ${deviceId} updated successfully`);
            console.log(`${device}`);
        } catch (error) {
            console.error(`Error updating device with DID ${DID}:`, error);
            throw error;
        }
    } else {
        console.log(`DID is not valid : ${statusOfDID}, DB_device : ${statusOfDB_device}, DB_deviceValue : ${statusOfDB_deviceValue}`);
        const error = new Error('DID | DB has error');
        error.status = 404;
        throw error
    }
    return {
        result: "success"
    };
};

const turnOnWakeUp = async (deviceId) => {
    let statusOfDID = checkDID(deviceId);
    let statusOfDB_device = checkDB_device(deviceId);
    let statusOfDB_deviceValue = checkDB_deviceValue(deviceId);

    if (statusOfDID && statusOfDB_device && statusOfDB_deviceValue) {
        try {
            const device = await Device.findOneAndUpdate(
                { deviceId: deviceId },
                { $set: { isWakeUpOn: true } },
                { new: true }
            );
            console.log(`Device with DID ${deviceId} updated successfully`);
            console.log(`${device}`);
        } catch (error) {
            console.error(`Error updating device with DID ${DID}:`, error);
            throw error;
        }
    } else {
        console.log(`DID is not valid : ${statusOfDID}, DB_device : ${statusOfDB_device}, DB_deviceValue : ${statusOfDB_deviceValue}`);
        const error = new Error('DID | DB has error');
        error.status = 404;
        throw error
    }
    return {
        result: "success"
    };
};

const turnOffWakeUp = async (deviceId) => {
    let statusOfDID = checkDID(deviceId);
    let statusOfDB_device = checkDB_device(deviceId);
    let statusOfDB_deviceValue = checkDB_deviceValue(deviceId);

    if (statusOfDID && statusOfDB_device && statusOfDB_deviceValue) {
        try {
            const device = await Device.findOneAndUpdate(
                { deviceId: deviceId },
                { $set: { isWakeUpOn: false } },
                { new: true }
            );
            console.log(`Device with DID ${deviceId} updated successfully`);
            console.log(`${device}`);
        } catch (error) {
            console.error(`Error updating device with DID ${DID}:`, error);
            throw error;
        }
    } else {
        console.log(`DID is not valid : ${statusOfDID}, DB_device : ${statusOfDB_device}, DB_deviceValue : ${statusOfDB_deviceValue}`);
        const error = new Error('DID | DB has error');
        error.status = 404;
        throw error
    }
    return {
        result: "success"
    };
};

const getSunriseTime = async () => {
    try {
        const response = await fetch(SUNRISE_URL, {
            method: 'GET',
            headers: { 'content-type': 'application/json' },
        }).then(res => {
            if (res.ok) {
                return res.json();
            }
        });
        console.log(response);
        return response[0].sunrise;
    } catch (error) {
        console.error('일출 시간 조회 중 오류:', error);
        throw error;
    }
};

const wakeUp = async () => {
    try {
        const devices = await Device.find({ isWakeUpOn: true }); //Find Device where isWakeUpOn is true
        console.log(devices);
        for (let device of devices) {
            let currentValue = findCurrentValue(device.deviceId);
            if (await controlDeviceValue(device.deviceId, currentValue, device.wakeUpValue)) {
                await insertDeviceValue(device.deviceId, device.wakeUpValue);
            } else {
                console.log(`network error with IoT`)
                const error = new Error('network error with IoT');
                error.status = 404;
                throw error;
            }
        }
    } catch (error) {
        console.error('wakeUp, checkDB_device, DB 조회 중 오류 발생:', error);
    }
};

module.exports = {
    turnOnDevice,
    turnOffDevice,
    setDeviceValue,
    setWakeUpValue,
    turnOnWakeUp,
    turnOffWakeUp,
    getSunriseTime,
    wakeUp,
    testWakeUpValue
};