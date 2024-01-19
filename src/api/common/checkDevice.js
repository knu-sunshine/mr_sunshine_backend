const mqtt  = require('../../../app');
let isResolved = false;
//console.log("mqtt: ", mqtt);
//console.log("mqtt client: ", mqtt.client);
function waitForIoT(Device_ID, timeout) {
    return new Promise((resolve, reject) => {
        const MQTT_TOPIC = `response/${Device_ID}`; //받을 topic 이름
        // 메시지 수신 이벤트 리스너
        const messageListener = function (topic, message) {
            if (topic === MQTT_TOPIC) {
                clearTimeout(timer); // 타이머 취소
                isResolved = true;
                mqtt.client.removeListener('message', messageListener); // 리스너 제거
                resolve(message.toString());
            }
        };

        // 타임아웃 시간이 지나면 호출될 함수
        const timer = setTimeout(() => {
            if (!isResolved) {
                mqtt.client.removeListener('message', messageListener); // 리스너 제거
                reject();
            }
        }, timeout);

        mqtt.client.subscribe(MQTT_TOPIC);
        mqtt.client.on('message', messageListener);
    });
}

function checkDevice(DID) {
    const MQTT_TOPIC = `check/${DID}`; //topic 이름
    const message = { "check_about": "d" }; //보낼 메세지
    mqtt.client.publish(MQTT_TOPIC, JSON.stringify(message)); //iot에게 보낸다
    return waitForIoT(`${DID}`, 5000) // 5초 안에 메시지를 기다립니다.
        .then(message => {
            console.log("Status of device is fine");
            return true;
        }) //상태 괜찮으면 해당 메시지 출력
        .catch(error => {
            console.log("Status of device is not fine");
            return false;
        }); //상태 안괜찮으면 해당 메시지 출력
}

module.exports = checkDevice;







