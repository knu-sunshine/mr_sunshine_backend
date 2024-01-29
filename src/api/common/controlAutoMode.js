const DeviceValue = require('../../database/models/deviceValueModel');
const mqtt = require('../../../app');
const controlDeviceValue = require('./controlDeviceValue');
const goalValue = 20;
let autoModeActive = true;

const findSensorDID = async (devices) => {
    try {
        const sensorDevices = devices.filter(device => device.deviceCategory === "Sensor");
        const sensorDIDs = sensorDevices.map(device => device.deviceId);
        return sensorDIDs;
    } catch (error) {
        console.error('Error finding sensor DIDs:', error);
        return [];
    }
};

const findDevicesDID = async (devices) => {
    try {
        const deviceList = devices.filter(device => device.deviceCategory !== "Sensor");
        const devicesDIDs = deviceList.map(device => device.deviceId);
        return devicesDIDs;
    } catch (error) {
        console.error('Error finding sensor DIDs:', error);
        return [];
    }
};

const findCurrentDeviceValue = async (DID) => {
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

const stopAutoMode = async () => {
    autoModeActive = false;
    console.log("Auto mode has been stopped.");
};

const controlAutoMode = async (devices) => {
    const SID = await findSensorDID(devices);
    const deviceList = await findDevicesDID(devices);
    console.log(`SID : ${SID}, deviceList : ${deviceList}`);
    const MQTT_TOPIC = `sensor/${SID}`;

    const messageHandler = async (topic, message) => {
        if (!autoModeActive) return; // Return immediately if auto mode is disabled

        try {
            const parsedMessage = JSON.parse(message.toString());
            const sensorValue = parsedMessage.sensor_value;
            for (let deviceId of deviceList) {
                //console.log("deviceId : ", deviceId);
                let deviceValue = await findCurrentDeviceValue(deviceId); //asynchronous processing
                let sendingValue = deviceValue;
                if (sensorValue > goalValue){
                    if(sendingValue - 5 >= 0)
                        sendingValue -= 5;
                    console.log("did : ", deviceId,  "sensor_value : ", sensorValue, " , current_value : ", deviceValue, " , sending_value : ", sendingValue);
                    await controlDeviceValue(deviceId, deviceValue, sendingValue);
                    await insertDeviceValue(deviceId, sendingValue); // save state to DB
                }
                else if (sensorValue < goalValue){
                    if(sendingValue + 5 <= 100)
                        sendingValue += 5;
                    console.log("did : ", deviceId, "sensor_value : ", sensorValue, " , current_value : ", deviceValue, " , sending_value : ", sendingValue);
                    await controlDeviceValue(deviceId, deviceValue, sendingValue);
                    await insertDeviceValue(deviceId, sendingValue); // save state to DB
                }
            }
        } catch (error) {
            console.error("Error in message handling:", error);
        }
    };

    mqtt.client.subscribe(MQTT_TOPIC);
    mqtt.client.on('message', messageHandler);

    while (autoModeActive) {
        await new Promise(resolve => setTimeout(resolve, 20000)); //check per 1 second
    }

    mqtt.client.unsubscribe(MQTT_TOPIC);
    mqtt.client.off('message', messageHandler); 
};

module.exports = {
    controlAutoMode,
    stopAutoMode
};
