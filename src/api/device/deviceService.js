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
    //DID를 입력 받고 해당 DID의 device를 on 시킨다.
    //DID check - 적절한 format인지 || DID가 연결되었는지 확인
    let statusOfDID = checkDID(deviceId) && await checkDevice(deviceId);
    //DB check - Device DB에 있는지 확인
    let statusOfDB_device = checkDB_device(deviceId);
    //DB check - DeviceValue DB에 있는지 확인
    let statusOfDB_deviceValue = checkDB_deviceValue(deviceId);
    //조건 성립하면 Device를 킨다
    if (statusOfDID && statusOfDB_device && statusOfDB_deviceValue) {
        let currentValue = await findCurrentValue(deviceId);
        if (controlDeviceValue(deviceId, currentValue, 100)) {
            await insertDeviceValue(deviceId, 100);
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
    //DID를 입력 받고 해당 DID의 device를 on 시킨다.
    //DID check - 적절한 format인지 || DID가 연결되었는지 확인
    let statusOfDID = checkDID(deviceId) && await checkDevice(deviceId);
    //DB check - Device DB에 있는지 확인
    let statusOfDB_device = checkDB_device(deviceId);
    //DB check - DeviceValue DB에 있는지 확인
    let statusOfDB_deviceValue = checkDB_deviceValue(deviceId);
    //조건 성립하면 Device를 킨다
    if (statusOfDID && statusOfDB_device && statusOfDB_deviceValue) {
        let currentValue = findCurrentValue(deviceId);
        if (controlDeviceValue(deviceId, currentValue, 0)) {
            await insertDeviceValue(deviceId, 0);
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
    //DID를 입력 받고 해당 DID의 device를 on 시킨다.
    //DID check - 적절한 format인지 || DID가 연결되었는지 확인
    let statusOfDID = checkDID(deviceId) && await checkDevice(deviceId);
    //DB check - Device DB에 있는지 확인
    let statusOfDB_device = checkDB_device(deviceId);
    //DB check - DeviceValue DB에 있는지 확인
    let statusOfDB_deviceValue = checkDB_deviceValue(deviceId);
    //조건 성립하면 Device를 킨다
    if (statusOfDID && statusOfDB_device && statusOfDB_deviceValue) {
        let currentValue = findCurrentValue(deviceId);
        if (controlDeviceValue(deviceId, currentValue, value)) {
            await insertDeviceValue(deviceId, value);
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
    //DID check - 적절한 format인지 || DID가 연결되었는지 확인
    let statusOfDID = checkDID(deviceId) && await checkDevice(deviceId);
    //DB check - Device DB에 있는지 확인
    let statusOfDB_device = checkDB_device(deviceId);
    //DB check - DeviceValue DB에 있는지 확인
    let statusOfDB_deviceValue = checkDB_deviceValue(deviceId);
    //조건 성립하면 DID의 wakeUpValue를 설정 및 isWakeUpOn을 true로
    if (statusOfDID && statusOfDB_device && statusOfDB_deviceValue) {
        try {
            const device = await Device.findOneAndUpdate(
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
    //DID check - 적절한 format인지 || DID가 연결되었는지 확인
    let statusOfDID = checkDID(deviceId) && await checkDevice(deviceId);
    //DB check - Device DB에 있는지 확인
    let statusOfDB_device = checkDB_device(deviceId);
    //DB check - DeviceValue DB에 있는지 확인
    let statusOfDB_deviceValue = checkDB_deviceValue(deviceId);
    //조건 성립하면 DID의 isWakeUpOn을 true로
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
    //DID check - 적절한 format인지 || DID가 연결되었는지 확인
    let statusOfDID = checkDID(deviceId) && await checkDevice(deviceId);
    //DB check - Device DB에 있는지 확인
    let statusOfDB_device = checkDB_device(deviceId);
    //DB check - DeviceValue DB에 있는지 확인
    let statusOfDB_deviceValue = checkDB_deviceValue(deviceId);
    //조건 성립하면 DID의 isWakeUpOn을 true로
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

module.exports = {
    turnOnDevice,
    turnOffDevice,
    setDeviceValue,
    setWakeUpValue,
    turnOnWakeUp,
    turnOffWakeUp
};