const DeviceValue = require('../../database/models/deviceValueModel');
const mqtt = require('../../../app');
const controlDeviceValue = require('./controlDeviceValue');
const goalValue = 80;
let autoModeActive = true;

const findCurrentDeviceValue = async (DID) => {
    try {
        // find newest Value by DID in mongoDB (sort descending)
        const currentValues = await DeviceValue.find({ deviceId: DID })
            .sort({ updateDate: -1 })
            .limit(1);
        return current_value; // return device list I found.
    } catch (error) {
        console.error('Can not find device :', error);
        return null; 
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
    const SID = await devices.filter(device => device.deviceCategory === "Sensor");
    const deviceList = await devices.filter(device => device.deviceCategory !== "Sensor");
    console.log(`SID : ${SID}, deviceList : ${deviceList}`);
    const MQTT_TOPIC = `sensor/${SID}`;

    const messageHandler = async (topic, message) => {
        if (!autoModeActive) return; // Return immediately if auto mode is disabled

        try {
            const parsedMessage = JSON.parse(message.toString());
            for (let device of deviceList) {
                let deviceValue = await findCurrentDeviceValue(device.deviceId); //asynchronous processing
 
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
        await new Promise(resolve => setTimeout(resolve, 1000)); //check per 1 second
    }

    for (let device of deviceList) {
        let deviceValue = await findCurrentDeviceValue(device.deviceId); // now value
        await insertDeviceValue(device.deviceId, deviceValue); // save state to DB
    }

    mqtt.client.unsubscribe(MQTT_TOPIC);
    mqtt.client.off('message', messageHandler); // 이벤트 리스너 제거
};

module.exports = {
    controlAutoMode,
    stopAutoMode
};
