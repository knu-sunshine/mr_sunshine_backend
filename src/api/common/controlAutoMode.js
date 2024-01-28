const DeviceValue = require('../../database/models/deviceValueModel');
const mqtt = require('../../../app');
const controlDeviceValue = require('./controlDeviceValue');
const goalValue = 80;
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
        // find newest Value by DID in mongoDB (sort descending)
        const currentValue = await DeviceValue.find({ deviceId: DID })
            .sort({ updateDate: -1 })
            .limit(1);
        return currentValue; // return device list I found.
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
    const SID = await findSensorDID(devices);
    const deviceList = await findDevicesDID(devices);
    console.log(`SID : ${SID}, deviceList : ${deviceList}`);
    const MQTT_TOPIC = `sensor/${SID}`;

    const messageHandler = async (topic, message) => {
        if (!autoModeActive) return; // Return immediately if auto mode is disabled

        try {
            const parsedMessage = JSON.parse(message.toString());
            for (let deviceId of deviceList) {
                let deviceValue = await findCurrentDeviceValue(deviceId); //asynchronous processing
                console.log(deviceValue);
                if (parsedMessage.sensor_value > goalValue)
                    await controlDeviceValue(deviceId, deviceValue, deviceValue - 1);
                else if (parsedMessage.sensor_value < goalValue)
                    await controlDeviceValue(deviceId, deviceValue, deviceValue + 1);
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

    for (let deviceId of deviceList) {
        let deviceValue = await findCurrentDeviceValue(deviceId); // now value
        await insertDeviceValue(deviceId, deviceValue); // save state to DB
    }

    mqtt.client.unsubscribe(MQTT_TOPIC);
    mqtt.client.off('message', messageHandler); 
};

module.exports = {
    controlAutoMode,
    stopAutoMode
};
