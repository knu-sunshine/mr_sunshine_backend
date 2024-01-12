const mqtt = require('mqtt'); //import mqtt package
const express = require('express');
const app = express();
const readline = require('readline'); //import readline to get input & output
const HOST = "192.168.203.116" //chan's ip 
const HTTP_PORT = 1521
const MQTT_PORT = 1883 //broker's port num
const publisher = mqtt.connect(`mqtt://${HOST}:${MQTT_PORT}`) //publsiher connection
const subscriber = mqtt.connect(`mqtt://${HOST}:${MQTT_PORT}`) //subscriber connection

const r = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

function registerDevice(Device_ID) {
    const MQTT_TOPIC = `check/${Device_ID}`; //topic 이름
    const message = { "check_about": "d" }; //보낼 메세지
    //console.log(MQTT_TOPIC);
    publisher.publish(MQTT_TOPIC, JSON.stringify(message)); //iot에게 보낸다
}

function waitForMessage(Device_ID, timeout) {
    return new Promise((resolve, reject) => {
        const MQTT_TOPIC = `response/${Device_ID}`; //받을 topic 이름
        //console.log(MQTT_TOPIC);
        let isResolved = false;

        // 메시지 수신 이벤트 리스너
        const messageListener = function (topic, message) {
            if (topic === MQTT_TOPIC) {
                clearTimeout(timer); // 타이머 취소
                isResolved = true;
                subscriber.removeListener('message', messageListener); // 리스너 제거
                resolve(message.toString());
            }
        };

        // 타임아웃 시간이 지나면 호출될 함수
        const timer = setTimeout(() => {
            if (!isResolved) {
                subscriber.removeListener('message', messageListener); // 리스너 제거
                reject(new Error('없는 pin번호 입니다'));
            }
        }, timeout);

        subscriber.subscribe(MQTT_TOPIC);
        subscriber.on('message', messageListener);
    });
}

//DID 등록과정
r.question('what is DID?', (DID) => {
    registerDevice(DID);  //DID 등록
    waitForMessage(`${DID}`, 10000) // 10초 안에 메시지를 기다립니다.
        .then(message => console.log('등록 성공:', message)) //등록 성공하면 해당 메시지 출력
        .catch(error => console.error('등록 실패', error.message)); //등록 실패하면 해당 메시지 출력
    r.close();
});

r.on('close', () => {
    console.log('기기 등록 중');
});

