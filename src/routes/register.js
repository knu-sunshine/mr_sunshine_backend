const mqtt = require('mqtt'); //import mqtt package
const readline = require('readline'); //import readline to get input & output
const MQTT_BROKER = "192.168.203.116" //chan's ip 
const MQTT_PORT = 1883 //broker's port num
const publisher = mqtt.connect(`mqtt://${MQTT_BROKER}:${MQTT_PORT}`) //connection

const r = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});


function registerDevice(DID) {
    const MQTT_TOPIC = `check/${DID}`;
    const message = { "check_about" : "d"};
    publisher.publish(MQTT_TOPIC, message);
}

function askDID() { //user input을 변경!!
    r.question('what is DID?', (DID) => {
        registerDevice(DID);  //DID 등록
        r.close();
    });
}

function main() {
    //DID 등록과정임
    //iot 쪽에 checkout : D를 보내준다

    //DID 입력 
    askDID();

    //iot로부터 연결되었다는 정보를 받는데
    //여기서 timeout을 걸어 일정 시간이 지나면 실패로 간주
    //받는다면 성공을 간주
    //iot에서는 message를 받은 다음 device_status check로 double check해줌
    //DB 등록 + user에게 정상등록 안내 
    r.on('close', () => {
        console.log('프로그램 종료');
    });
    setTimeout(10000);
}

if (require.main === module) {
    main();
}