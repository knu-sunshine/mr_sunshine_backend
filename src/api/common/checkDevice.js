const mqtt  = require('../../../app');
let isResolved = false;
//console.log("mqtt: ", mqtt);
//console.log("mqtt client: ", mqtt.client);
const waitForIoT = (Device_ID, timeout) => {
    return new Promise((resolve, reject) => {
        const MQTT_TOPIC = `response/${Device_ID}`; //topic name to send.
        // Event Listner
        const messageListener = function (topic, message) {
            if (topic === MQTT_TOPIC) {
                clearTimeout(timer); // clear time
                isResolved = true;
                mqtt.client.removeListener('message', messageListener); // remove listener
                resolve(message.toString());
            }
        };

        // function will be called when time out.
        const timer = setTimeout(() => {
            if (!isResolved) {
                mqtt.client.removeListener('message', messageListener); // remove listener
                reject();
            }
        }, timeout);

        mqtt.client.subscribe(MQTT_TOPIC);
        mqtt.client.on('message', messageListener);
    });
};

const checkDevice = async (DID) => {
    const MQTT_TOPIC = `check/${DID}`; //topic name
    const message = { "check_about": "d" }; //message to send
    mqtt.client.publish(MQTT_TOPIC, JSON.stringify(message)); //send to IOT
    return await waitForIoT(`${DID}`, 5000) // wait message fot 5 second
        .then(message => {
            console.log("Status of device is fine");
            return true;
        }) //Good state
        .catch(error => {
            console.log("Status of device is not fine");
            return false;
        }); //Bad state
};

module.exports = checkDevice;







