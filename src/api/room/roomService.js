const Room = require('../../database/models/roomModel');
const Device = require('../../database/models/deviceModel');
const DeviceValue = require('../../database/models/deviceValueModel');
const checkDevice = require('../common/checkDevice');
const controlDeviceValue = require('../common/controlDeviceValue');
const autoMode = require('../common/controlAutoMode');

//적절한 RID인지 확인
const checkDID = async (DID) => {
    if (DID.length === 4 && (DID[0] === 'L' || DID[0] === 'C' || DID[0] === 'S')) {
        return true;
    }
    return false;
};

//DB를 check하는 함수
const checkDB_room_old = async (RID) => {
    try {
        // 데이터베이스에서 roomId가 RID인 row 찾기
        const room = await Room.findOne({ roomId: RID });

        // row가 존재하면 true, 그렇지 않으면 false 반환
        return room != null;
    } catch (error) {
        console.error('checkDB_room, DB 조회 중 오류 발생:', error);
        return false; // 오류 발생 시 false 반환
    }
};

const checkDB_device_new = async (DID) => {
    try {
        // device 디비에서 같은 did가 들어오는 경우를 check
        const device = await Device.findOne({ deviceId: DID });
        if (device)
            return false;
        return true;
    } catch (error) {
        console.error('checkDB_device, DB 조회 중 오류 발생:', error);
        return false; // 오류 발생 시 false 반환
    }
};

const checkDB_device_old = async (RID) => {
    try {
        const devices = await Device.find({ roomId: RID });
        const hasSensor = devices.some(device => Device.deviceCategory === 'Sensor');
        if (hasSensor) {
            const hasDevice = devices.some(device => Device.deviceCategory !== 'Sensor');
            if (hasDevice)
                return true;
        }
        return false;
    } catch (error) {
        console.error('DB 조회 중 오류 발생:', error);
        return false; // 오류 발생 시 false 반환
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

const findRoomName = async (RID) => {
    try {
        const name = await Room.findOne({ roomId: RID });
        return name.roomName;
    } catch (error) {
        console.error('findRoomName, DB 조회 중 오류 발생:', error);
        return false; // 오류 발생 시 false 반환
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
        // MongoDB에서 해당 RID를 가진 장치들 찾기
        const devices = await Device.find({ 
            roomId: RID,
            deviceCategory: { $ne: 'Sensor' }
        });
        //console.log("findDevice()", devices);
        return devices; // 찾은 장치 리스트 반환
    } catch (error) {
        console.error('장치 검색 중 오류 발생:', error);
        return []; // 오류 발생 시 빈 리스트 반환
    }
};

const findCurrentDeviceValue = async (DID) => {
    try {
        // MongoDB에서 해당 DID의 최신 value 찾기 (updateDate 내림차순으로 정렬)
        const currentValue = await DeviceValue.find({ deviceId: DID })
            .sort({ updateDate: -1 })
            .limit(1)
            .select('value');
        //console.log(currentValue[0].value);
        return currentValue[0].value; // 찾은 장치 리스트 반환
    } catch (error) {
        console.error('장치 검색 중 오류 발생:', error);
        return null; // 오류 발생 시 빈 리스트 반환
    }
};

const getDeviceList = async (roomId) => {
    //DB에서 해당하는 방 찾자
    let statusOfDB_room = await checkDB_room_old(roomId); //DB에 RID가 있는지 체크
    if (statusOfDB_room) {
        let device_list = await findDevice(roomId); //기기 찾아옴 리스트로 정리
        return device_list;
    } else {
        console.log(`new roomid error`)
        const error = new Error('it should be registered');
        error.status = 404;
        throw error;
    }
};

const addDevice = async (roomId, deviceId, deviceName) => {
    let statusOfDB_room = await checkDB_room_old(roomId); //DB에 RID가 있는지 체크
    let statusOfDB_device = await checkDB_device_new(deviceId); //DB에 DID가 새로운건지
    let statusOfRID = await checkDID(deviceId); //적절한 DID인지
    let statusOfDID = await checkDevice(deviceId); //DID가 연결되었는지
    let roomName = await findRoomName(roomId);
    let category = await findDeviceCategory(deviceId);

    if (statusOfDB_room && statusOfRID && statusOfDID & statusOfDB_device) {
        //디비에 아무 문제 없고, 적절한 RID이고, DID 연결되었으면
        const deviceRow = [
            {
                deviceId: deviceId,
                roomId: roomId,
                deviceName: deviceName,
                deviceStatus: false,
                deviceCategory: category,
                isdeviceOn: false
            }
        ];
        //기기를 디비에 등록 -> registerDB, Device 스키마
        try {
            await Device.insertMany(deviceRow);
            await insertDeviceValue(deviceId, 0);
            console.log("On device model, data seeded successfully");
        } catch (error) {
            console.error("Error seeding device database:", error);
        }
        //body에 돌려줄 내용 잘 정리해서 보내줌
        console.log("addDevice success");
        return {
            deviceId: deviceId,
            currentStatus: 0,
            ifDeviceOn: false,
            wakeUpDegree: 0,
            category: category,
            roomId: roomId,
            roomName: roomName
        };
    } else {
        console.log(`IoT connection error: ${statusOfDID}, DB_room error : ${statusOfDB_room}, DB_device : ${statusOfDB_device}, RID error : ${statusOfRID}`);
        const error = new Error('adding device fail');
        error.status = 404;
        throw error;
    }
};

const setRoomOn = async (roomId) => {
    //DB에서 해당하는 방 찾자
    let statusOfDB_room = await checkDB_room_old(roomId); //DB에 RID가 있는지 체크
    //console.log(statusOfDB_room);
    if (statusOfDB_room) {
        let device_list = await findDevice(roomId); //기기 찾아옴 리스트로 정리
        //console.log(device_list);
        for (let device of device_list) {
            let device_value = await findCurrentDeviceValue(device.deviceId);
            if (device_value === null)
                continue;
            if (controlDeviceValue(device.deviceId, device_value, 100)) {// 각 기기에 대해 비동기 함수 실행
                await insertDeviceValue(device.deviceId, 100); //device_value에 새로운 row 추가
            } else {
                console.log(`network error with IoT`)
                const error = new Error('network error with IoT');
                error.status = 404;
                throw error;
            }
        }
        return {
            result: "success"
        };
    } else {
        console.log(`new roomid error`)
        const error = new Error('it should be registered');
        error.status = 404;
        throw error;
    }
};

const setRoomOff = async (roomId) => {
    //DB에서 해당하는 방 찾자
    let statusOfDB_room = await checkDB_room_old(roomId); //DB에 RID가 있는지 체크

    if (statusOfDB_room) {
        let device_list = await findDevice(roomId); //기기 찾아옴 리스트로 정리
        for (let device of device_list) {
            let device_value = await findCurrentDeviceValue(device.deviceId);
            if (device_value === null)
                continue;
            if (controlDeviceValue(device.deviceId, device_value, 0)) {// 각 기기에 대해 비동기 함수 실행
                await insertDeviceValue(device.deviceId, 0); //device_value에 새로운 row 추가
            } else {
                console.log(`network error with IoT`)
                const error = new Error('network error with IoT');
                error.status = 404;
                throw error;
            }
        }
        return {
            result: "success"
        };
    } else {
        console.log(`new roomid error`)
        const error = new Error('it should be registered');
        error.status = 404;
        throw error;
    }
};

const setAutoModeOn = async (roomId) => {
    //DB check
    let statusOfDB_room = await checkDB_room_new(roomId); //DB에 RID가 있는지 체크
    let statusOfDB_device = await checkDB_device_old(roomId); //DBdp RID에 해당하는 Device에 Sensor 있는지 체크 & sensor 제외 Device가 1개 이상인지 체크 필요 

    if (statusOfDB_room && statusOfDB_device) {
        let device_list = await findDevice(roomId); //기기 찾아옴 리스트로 정리
        for (let device of device_list) {
            let statusOfDevice = checkDevice(device.deviceId); //각 Device가 연결되었는지 check
            if (!statusOfDevice) {
                console.log('devices are not ready, checkDevice returns false');
                const error = new Error('devices are not ready');
                error.status = 404;
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
        error.status = 404;
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