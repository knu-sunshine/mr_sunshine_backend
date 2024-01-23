const DeviceValue = require('../../database/models/deviceValueModel');
const mqtt = require('../../../app');
const controlDeviceValue = require('./controlDeviceValue');
const goalValue = 80;
let autoModeActive = true;

const findSensor = async (devices) => {
    //devices에서 sensor인 기기만 return
    return devices.find(device => device.category === "Sensor");
};

const findDevices = async (devices) => {
    return devices.find(device => device.category !== "Sensor");
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

const stopAutoMode = async () => {
    autoModeActive = false;
    console.log("Auto mode has been stopped.");
};

const controlAutoMode = async (devices) => {
    const SID = await findSensor(devices);
    const deviceList = await findDevices(devices);
    const MQTT_TOPIC = `sensor/${SID}`;

    const messageHandler = async (topic, message) => {
        if (!autoModeActive) return; // 자동 모드가 비활성화된 경우 바로 반환

        try {
            const parsedMessage = JSON.parse(message.toString());
            for (let device of deviceList) {
                let deviceValue = await findCurrentDeviceValue(device.deviceId); // 비동기 처리
                if (parsedMessage.sensor_value > goal)
                    await controlDeviceValue(device.deviceId, deviceValue, deviceValue - 1);
                else if (parsedMessage.sensor_value < goal)
                    await controlDeviceValue(device.deviceId, deviceValue, deviceValue + 1);
            }
        } catch (error) {
            console.error("Error in message handling:", error);
        }
    };

    mqtt.client.subscribe(MQTT_TOPIC);
    mqtt.client.on('message', messageHandler);

    while (autoModeActive) {
        await new Promise(resolve => setTimeout(resolve, 1000)); // 1초마다 확인
    }

    for (let device of deviceList) {
        let deviceValue = await findCurrentDeviceValue(device.deviceId); // 현재 기기 값 가져오기
        await insertDeviceValue(device.deviceId, deviceValue); // DB에 상태 저장
    }

    mqtt.client.unsubscribe(MQTT_TOPIC);
    mqtt.client.off('message', messageHandler); // 이벤트 리스너 제거
};

module.exports = {
    controlAutoMode,
    stopAutoMode
};
