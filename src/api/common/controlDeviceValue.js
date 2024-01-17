const mqtt = require('../../../app');
let isResolved = false;

function waitForIoT(Device_ID, timeout) {
    return new Promise((resolve, reject) => {
        const MQTT_TOPIC = `result/${Device_ID}`;
        let isResolved = false;

        mqtt.client.subscribe(MQTT_TOPIC, () => {
            mqtt.client.on('message', (topic, message) => {
                if (topic === MQTT_TOPIC) {
                    try {
                        const parsedMessage = JSON.parse(message.toString());
                        if (parsedMessage.result === "success") {
                            clearTimeout(timer);
                            isResolved = true;
                            mqtt.client.unsubscribe(MQTT_TOPIC);
                            resolve(parsedMessage); // 혹은 필요한 데이터만 추출하여 반환
                        }else
                            reject(new Error("Fail"));
                    } catch (error) {
                        reject(new Error("Invalid JSON format"));
                    }
                }
            });
        });

        const timer = setTimeout(() => {
            if (!isResolved) {
                mqtt.client.unsubscribe(MQTT_TOPIC);
                reject(new Error("Timeout"));
            }
        }, timeout);
    });
}

function controlDeviceValue(DID, value) {
    const MQTT_TOPIC = `control/${DID}`; //topic 이름
    const message = { "device_value": value }; //보낼 메세지
    mqtt.client.publish(MQTT_TOPIC, JSON.stringify(message)); //iot에게 보낸다
    waitForIoT(`${DID}`, 5000) // 5초 안에 메시지를 기다립니다.
        .then(message => {
            console.log("Control of device is success");
            return true;
        }) //상태 괜찮으면 해당 메시지 출력
        .catch(error => {
            console.log("Control of device is fail", error);
            return false;
        }); //상태 안괜찮으면 해당 메시지 출력
}

module.exports = controlDeviceValue;