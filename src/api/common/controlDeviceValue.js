const mqtt = require('../../../app');
const checkDevice = require('./checkDevice');
let isResolved = false;

const setValue = (DID, current_value, goal_value) => {
    if(DID[0] === 'C'){
        return goal_value - current_value;
    }   
    else if(DID[0] === 'L')
        return goal_value;
};

const waitForIoT = (Device_ID, timeout) => {
    return new Promise((resolve, reject) => {
        const MQTT_TOPIC = `result/${Device_ID}`;

        // Define message handler function
        const messageHandler = (topic, message) => {
            if (topic === MQTT_TOPIC) {
                try {
                    const parsedMessage = JSON.parse(message.toString());
                    if (parsedMessage.result === "success") {
                        resolve(parsedMessage);
                    } else {
                        reject(new Error("Failed operation"));
                    }
                } catch (error) {
                    reject(new Error("Invalid JSON format"));
                } finally {
                    clearTimeout(timer);
                    mqtt.client.unsubscribe(MQTT_TOPIC);
                    mqtt.client.removeListener('message', messageHandler);
                }
            }
        };

        // setting message handler
        mqtt.client.subscribe(MQTT_TOPIC);
        mqtt.client.on('message', messageHandler);

        // Timeout handler
        const timer = setTimeout(() => {
            mqtt.client.unsubscribe(MQTT_TOPIC);
            mqtt.client.removeListener('message', messageHandler);
            reject(new Error("Timeout"));
        }, timeout);
    });
};

const controlDeviceValue = (DID, current_value, goal_value) => {
    if(!checkDevice(DID)){
        console.log('before control, connection lost');   
        return false;
    }
    let value = setValue(DID, current_value, goal_value);
    const MQTT_TOPIC = `control/${DID}`; //topic name
    const message = { "device_value": value }; //messagt to send
    mqtt.client.publish(MQTT_TOPIC, JSON.stringify(message)); //send to IOT
    return waitForIoT(`${DID}`, 10000) // wait 5 second for message
        .then(message => {
            console.log("Control of device is success");
            return true;
        }) //Good states
        .catch(error => {
            console.log("Control of device is fail", error);
            return false;
        }); //bad states
};

module.exports = controlDeviceValue;