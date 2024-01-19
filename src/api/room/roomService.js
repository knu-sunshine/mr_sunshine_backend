const Room = require('../../database/models/roomModel');
const Device = require('../../database/models/deviceModel');
const DeviceValue = require('../../database/models/deviceValueModel');
const checkDevice = require('../common/checkDevice');
const controlDeviceValue = require('../common/controlDeviceValue');

//적절한 RID인지 확인
const checkRoomID = async (DID) => {
    if (DID.length === 4 && (DID[0] === 'L' || DID[0] === 'C')) {
        return true;
    }
    return false;
};

//DB를 check하는 함수
const checkDB_room = async (RID) => {
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

const checkDB_device = async (DID) => {
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
};

const findDevice = async (RID) => {
    try {
        // MongoDB에서 해당 RID를 가진 장치들 찾기
        const devices = await Device.find({ RID: RID });
        return devices; // 찾은 장치 리스트 반환
    } catch (error) {
        console.error('장치 검색 중 오류 발생:', error);
        return []; // 오류 발생 시 빈 리스트 반환
    }
};

const findCurrentDeviceValue = async (DID) => {
    try {
        // MongoDB에서 해당 DID의 최신 value 찾기 (updateDate 내림차순으로 정렬)
        const currentValues = await DeviceValue.find({ deviceId: DID })
            .sort({ updateDate: -1 })
            .limit(1);
        return current_value; // 찾은 장치 리스트 반환
    } catch (error) {
        console.error('장치 검색 중 오류 발생:', error);
        return null; // 오류 발생 시 빈 리스트 반환
    }
};

const addDevice = async (roomId, deviceId, deviceName) => {
    let statusOfDB_room = await checkDB_room(roomId); //DB에 RID가 있는지 체크
    let statusOfDB_device = await checkDB_device(deviceId); //DB에 DID가 새로운건지
    let statusOfRID = await checkRoomID(deviceId); //적절한 RID인지
    let statusOfDID = await checkDevice(deviceId); //DID가 연결되었는지
    let roomName = await findRoomName(roomId);
    let category = await findDeviceCategory(deviceId);

    if (statusOfDB && statusOfRID && statusOfDID & statusOfDB_device) {
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
    let statusOfDB_room = await checkDB_room(roomId); //DB에 RID가 있는지 체크

    if (statusOfDB_room) {
        let device_list = await findDevice(roomId); //기기 찾아옴 리스트로 정리
        for (let device of device_list) {
            let device_value = findCurrentDeviceValue(device.deviceId);
            if (device_value === null)
                continue;
            if (await controlDeviceValue(device.deviceId, device_value, 100)) {// 각 기기에 대해 비동기 함수 실행
                insertDeviceValue(device.deviceId, 100); //device_value에 새로운 row 추가
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
    let statusOfDB_room = await checkDB_room(roomId); //DB에 RID가 있는지 체크

    if (statusOfDB_room) {
        let device_list = await findDevice(roomId); //기기 찾아옴 리스트로 정리
        for (let device of device_list) {
            let device_value = findCurrentDeviceValue(device.deviceId);
            if (device_value === null)
                continue;
            if (await controlDeviceValue(device.deviceId, device_value, 0)) {// 각 기기에 대해 비동기 함수 실행
                insertDeviceValue(device.deviceId, 0); //device_value에 새로운 row 추가
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

const getDeviceList = async (roomId) => {
    //DB에서 해당하는 방 찾자
    let statusOfDB_room = await checkDB_room(roomId); //DB에 RID가 있는지 체크
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


module.exports = {
    addDevice,
    setRoomOn,
    setRoomOff,
    getDeviceList
};