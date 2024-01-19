const Room = require('../../database/models/roomModel');
const Device = require('../../database/models/deviceModel');
const checkDevice = require('../common/checkDevice');
const controlDeviceValue = require('../common/controlDeviceValue');

//적절한 RID인지 확인
const checkRoomID = async (DID) => {
    if (DID.length === 4 && (DID[0] === 'L' || DID[0] === 'C')) {
        return true;
    }
    return false;
}

//DB를 check하는 함수
const checkDB = async (RID, DID) => {
    try {
        // 데이터베이스에서 roomId가 RID인 문서 찾기
        const room = await Room.findOne({ roomId: RID });
        // device 디비에서 같은 did가 들어오는 경우를 check
        const device = await Device.findOne({ deviceId: DID });
        if (device)
            return false;
        // 문서가 존재하면 true, 그렇지 않으면 false 반환
        return room != null;
    } catch (error) {
        console.error('checkDB, DB 조회 중 오류 발생:', error);
        return false; // 오류 발생 시 false 반환
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
}

const findDeviceCategory = async (DID) => {
    if (DID[0] === 'L') {
        return "Light";
    }
    else if (DID[0] === 'C') {
        return "Curtain";
    }
}

const addDevice = async (roomId, deviceId, deviceName) => {
    let statusOfDB = await checkDB(roomId, deviceId); //DB에 업로드할 때 아무 문제 없는지
    let statusOfRID = await checkRoomID(deviceId); //적절한 RID인지
    let statusOfDID = await checkDevice(deviceId); //DID가 연결되었는지
    let roomName = await findRoomName(roomId);
    let category = await findDeviceCategory(deviceId);

    if (statusOfDB && statusOfRID && statusOfDID) {
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
            await Device.insertMany(deviceInfo);
            console.log("On device model, data seeded successfully");
        } catch (error) {
            console.error("Error seeding database:", error);
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
        console.log(`DB error : ${statusOfDB}, DID error : ${statusOfDID}, RID error : ${statusOfRID}`)
        const error = new Error('adding device fail');
        error.status = 404;
        throw error;
    }
};

const setRoomLightOn = async (roomId, deviceId) => {
    //DB에서 해당하는 방 & 기기 찾자
    let isOn = true; //일단 있다고 가정 -> 디비 이슈 해결 후 진행

    if (isOn) {
        //controlDeviceValue를 100으로 설정
        let isSuccess = controlDeviceValue(deviceId, 100);
        if (isSuccess) {
            //디비에 해당 방 & 기기의 정보 등록
            //updateDB();
            //body에 돌려줄 내용 잘 정리해서 보내줌
            console.log("setRoomLightOn success");
            return {
                result: "Success"
            };
        } else {
            console.log(`communicating IoT : ${isSuccess}`)
            const error = new Error('there is a problem on IoT');
            error.status = 404;
            throw error;
        }


    } else {//에러처리 - DB에 없으면
        console.log(`Not exist on DB : ${isOn}`)
        const error = new Error('room & device do not register');
        error.status = 404;
        throw error;
    }
};


module.exports = {
    addDevice,
    setRoomLightOn
};