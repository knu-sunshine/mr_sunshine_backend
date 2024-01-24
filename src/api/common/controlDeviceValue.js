const mqtt = require('../../../app');
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

        // 메시지 핸들러 함수 정의
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

        // 메시지 핸들러 설정
        mqtt.client.subscribe(MQTT_TOPIC);
        mqtt.client.on('message', messageHandler);

        // 타임아웃 핸들러
        const timer = setTimeout(() => {
            mqtt.client.unsubscribe(MQTT_TOPIC);
            mqtt.client.removeListener('message', messageHandler);
            reject(new Error("Timeout"));
        }, timeout);
    });
};

const controlDeviceValue = (DID, current_value, goal_value) => {
   // console.log(`DID: ${DID}, current_value: ${current_value}, goal_value: ${goal_value}`);
    let value = setValue(DID, current_value, goal_value); //value값 지정 led이냐 curtain에 따른 value 달라야함
    //console.log(`DID: ${DID}, value: ${value}`);
    const MQTT_TOPIC = `control/${DID}`; //topic 이름
    const message = { "device_value": value }; //보낼 메세지
    mqtt.client.publish(MQTT_TOPIC, JSON.stringify(message)); //iot에게 보낸다
    return waitForIoT(`${DID}`, 10000) // 5초 안에 메시지를 기다립니다.
        .then(message => {
            console.log("Control of device is success");
            return true;
        }) //상태 괜찮으면 해당 메시지 출력
        .catch(error => {
            console.log("Control of device is fail", error);
            return false;
        }); //상태 안괜찮으면 해당 메시지 출력
};

module.exports = controlDeviceValue;