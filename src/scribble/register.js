const HOST = "192.168.203.116" //chan's ip 
const mqtt = require('mqtt'); //import mqtt package
const MQTT_PORT = 1883 //broker's port num
const publisher = mqtt.connect(`mqtt://${HOST}:${MQTT_PORT}`) //publsiher connection
const subscriber = mqtt.connect(`mqtt://${HOST}:${MQTT_PORT}`) //subscriber connection
const HTTP_PORT = 3000
const express = require('express');
const app = express();
let isResolved = false;

function registerDevice(Device_ID) {
    const MQTT_TOPIC = `check/${Device_ID}`; //topic 이름
    const message = { "check_about": "d" }; //보낼 메세지
    //console.log(MQTT_TOPIC);
    publisher.publish(MQTT_TOPIC, JSON.stringify(message)); //iot에게 보낸다
}

function waitForIoT(Device_ID, timeout) {
    return new Promise((resolve, reject) => {
        const MQTT_TOPIC = `response/${Device_ID}`; //받을 topic 이름
        //console.log(MQTT_TOPIC);
        
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
                reject();
            }
        }, timeout);

        subscriber.subscribe(MQTT_TOPIC);
        subscriber.on('message', messageListener);
    });
}

app.use(express.json());

app.post('/api/register', (req, res) => {
    // POST 요청에서 user로부터 데이터를 받아옴
    const DID = req.body.DID;
    let isNew = true; //나중에 false로 setting 후 DB check이후 true로 설정
    //console.log(DID);
    
    //DB에서 이미 등록된 기기인지 check 필요

    //신규 등록 기기이면
    if(isNew){
        registerDevice(DID);  //DID 등록
        waitForIoT(`${DID}`, 10000) // 10초 안에 메시지를 기다립니다.
            .then(message =>  {
                if(isResolved){ //기기가 정상적으로 등록되었다면    
                    console.log('db에 기기(DID 정보) 저장해야합니다.');
                }
                res.json({ message: '기기가 정상적으로 등록되었습니다.', data: DID })
            }) //등록 성공하면 해당 메시지 출력
            .catch(error =>  res.json({ message: '잘못된 기기 id입니다.', data: DID })); //등록 실패하면 해당 메시지 출력
    }else{ //이미 등록된 기기이면 종료
        res.json({ message: '이미 등록된 기기입니다.', data: DID });
    }
});

app.listen(HTTP_PORT, HOST, () => {
    console.log(`서버가 http://${HOST}:${HTTP_PORT} 에서 실행 중입니다.`);
});






