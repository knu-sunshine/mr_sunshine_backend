const Room = require('../../database/models/roomModel');
const Device = require('../../database/models/deviceModel');
const DeviceValue = require('../../database/models/deviceValueModel')
const checkDevice = require('../common/checkDevice');
const controlDeviceValue = require('../common/controlDeviceValue');
const autoMode = require('../common/controlAutoMode');

const checkDID = async (DID) => {
    if (DID.length === 4 && (DID[0] === 'L' || DID[0] === 'C' || DID[0] === 'S')) {
        return true;
    }
    return false;
};

const checkDB_room_old = async (RID) => {
    try {
        const room = await Room.findOne({ roomId: RID });
        return room != null;
    } catch (error) {
        console.error('checkDB_room, DB 조회 중 오류 발생:', error);
        return false;
    }
};

const checkDB_device_new = async (DID) => {
    try {
        const device = await Device.findOne({ deviceId: DID });
        if (device)
            return false;
        return true;
    } catch (error) {
        console.error('checkDB_device, DB 조회 중 오류 발생:', error);
        return false;
    }
};

const checkDB_device_old = async (RID) => {
    try {
        const devices = await Device.find({ roomId: RID });
        const hasSensor = devices.some(device => device.deviceCategory === 'Sensor');
        if (hasSensor) {
            const hasDevice = devices.some(device => device.deviceCategory !== 'Sensor');
            if (hasDevice) {
                return true;
            }
        }
        return false;
    } catch (error) {
        console.error('DB 조회 중 오류 발생:', error);
        return false;
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

const updateRoom = async (RID, value) => {
    try {
        const room = await Room.findOne({ roomId: RID });
        if (room) {
            room.isRoomLightOn = value === 0 ? false : true;
            await room.save();
        } else {
            console.log(`Room not found for roomId: ${RID}`);
        }
    } catch (error) {
        console.error(`Error updating room light status: ${error}`);
        throw error;
    }
};

const findDeviceCategory = async (DID) => {
    if (DID[0] === 'L') {
        return "Light";
    }
    else if (DID[0] === 'C') {
        return "Curtain";
    }
    else if (DID[0] === 'S') {
        return "Sensor";
    }
};

const findDevice = async (RID) => {
    try {
        const devices = await Device.find({
            roomId: RID
        });
        return devices;
    } catch (error) {
        console.error('장치 검색 중 오류 발생:', error);
        return [];
    }
};

const findCurrentDeviceValue = async (DID) => {
    try {
        const currentValue = await DeviceValue.find({ deviceId: DID })
            .sort({ updateDate: -1 })
            .limit(1)
            .select('value');
        return currentValue[0].value;
    } catch (error) {
        console.error('장치 검색 중 오류 발생:', error);
        return null;
    }
};

const getDeviceList = async (roomId) => {
    let statusOfDB_room = await checkDB_room_old(roomId); //Check RID is on room DB or not
    console.log("getdevice");
    if (statusOfDB_room) {
        let device_list = await findDevice(roomId); //Find device_list except sensor
        for (let device of device_list) {
            if (!await checkDevice(device.deviceId)) { //Check DID is connected or not
                console.log(`${device.deviceId} is not connected`);
                const error = new Error(`${device.deviceId} is not connected`);
                error.status = 500;
                throw error;
            }
        }
        console.log("getDeviceList success");
        return device_list;
    } else {
        console.log(`new roomid error`)
        const error = new Error('it should be registered');
        error.status = 500;
        throw error;
    }
};

const addDevice = async (roomId, deviceId, deviceName) => {
    let statusOfDB_room = await checkDB_room_old(roomId); //Check RID is on room DB or not
    let statusOfDB_device = await checkDB_device_new(deviceId); //Check DID is new or not
    let statusOfDID = await checkDevice(deviceId) && await checkDID(deviceId); //Check DID is connected and valid or not

    if (statusOfDB_room && statusOfDID && statusOfDB_device) {
        let category = await findDeviceCategory(deviceId);
        const deviceRow = [
            {
                deviceId: deviceId,
                roomId: roomId,
                deviceName: deviceName,
                deviceStatus: 0,
                deviceCategory: category,
                isdeviceOn: false,
                wakeUpValue: 0,
            }
        ];
        try {
            await Device.insertMany(deviceRow);
            await insertDeviceValue(deviceId, 0);
            console.log("On device model, data seeded successfully");
        } catch (error) {
            console.error("Error seeding device database:", error);
        }
        console.log("addDevice success");
        const device = await Device.findOne({ deviceId });
        return device;
    } else {
        console.log(`IoT connection error: ${statusOfDID}, DB_room error : ${statusOfDB_room}, DB_device : ${statusOfDB_device}`);
        const error = new Error('adding device fail');
        error.status = 500;
        throw error;
    }
};

const setRoomOn = async (roomId) => {
    let statusOfDB_room = await checkDB_room_old(roomId); //Check RID is on room DB or not
    if (statusOfDB_room) {
        let device_list = await findDevice(roomId); //Find device_list except sensor
        if (device_list.length > 0) {
            for (let device of device_list) {
                let device_value = await findCurrentDeviceValue(device.deviceId); //Find currentvalue for DID
                if (device_value === null) {
                    console.log(`${device_value} is not defined on DB`);
                    continue;
                }
                if (controlDeviceValue(device.deviceId, device_value, 100)) { //Control device to 100
                    await insertDeviceValue(device.deviceId, 100); //Insert new row to DB
                    await updateDevice(device.deviceId, 100); //Update Device
                    await updateRoom(roomId, 100); //Update Room
                    console.log("setRoomOn success");
                } else {
                    console.log(`network error with IoT`)
                    const error = new Error('network error with IoT');
                    error.status = 500;
                    throw error;
                }
            }
        } else {
            console.log(`no device register for the room`)
            const error = new Error('devices should be registered');
            error.status = 500;
            throw error;
        }
        return {
            result: "success"
        };
    } else {
        console.log(`new roomid error`)
        const error = new Error('it should be registered');
        error.status = 500;
        throw error;
    }
};

const setRoomOff = async (roomId) => {
    let statusOfDB_room = await checkDB_room_old(roomId); //Check RID is on room DB or not
    if (statusOfDB_room) {
        let device_list = await findDevice(roomId); //Find device_list except sensor
        if (device_list.length > 0) {
            for (let device of device_list) {
                let device_value = await findCurrentDeviceValue(device.deviceId); //Find currentvalue for DID
                if (device_value === null) {
                    console.log(`${device_value} is not defined on DB`);
                    continue;
                }
                if (controlDeviceValue(device.deviceId, device_value, 0)) { //Control device to 100
                    await insertDeviceValue(device.deviceId, 0); //Insert new row to DB
                    await updateDevice(device.deviceId, 100); //Update Device
                    await updateRoom(roomId, 100); //Update Room
                    console.log("setRoomOff success");
                } else {
                    console.log(`network error with IoT`)
                    const error = new Error('network error with IoT');
                    error.status = 500;
                    throw error;
                }
            }
        } else {
            console.log(`no device register for the room`)
            const error = new Error('devices should be registered');
            error.status = 500;
            throw error;
        }
        return {
            result: "success"
        };
    } else {
        console.log(`new roomid error`)
        const error = new Error('it should be registered');
        error.status = 500;
        throw error;
    }
};

const setAutoModeOn = async (roomId) => {
    let statusOfDB_room = await checkDB_room_old(roomId); //
    let statusOfDB_device = await checkDB_device_old(roomId); //DB에 RID에 해당하는 Device에 Sensor 있는지 체크 & sensor 제외 Device가 1개 이상인지 체크 필요 

    if (statusOfDB_room && statusOfDB_device) {
        let device_list = await findDevice(roomId); //기기 찾아옴 리스트로 정리
        for (let device of device_list) {
            let statusOfDevice = checkDevice(device.deviceId); //각 Device가 연결되었는지 check
            if (!statusOfDevice) {
                console.log('devices are not ready, checkDevice returns false');
                const error = new Error('devices are not ready');
                error.status = 500;
                throw error;
            }
        }
        await autoMode.controlAutoMode(device_list);

        return {
            result: "success"
        };

    } else {
        console.log(`room_DB: ${statusOfDB_room}, device_DB: ${statusOfDB_device}`);
        const error = new Error('no info about room or device');
        error.status = 500;
        throw error;
    }
};

const setAutoModeOff = async (roomId) => {
    const devices = await autoMode.stopAutoMode();
    for (let device of devices) {
        insert(device.id, device.value); //automode의 마지막 값을 받아와서 그 값을 디비에 저장
    }
};

module.exports = {
    addDevice,
    setRoomOn,
    setRoomOff,
    setAutoModeOn,
    setAutoModeOff,
    getDeviceList
};