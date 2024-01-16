const mqtt = require('mqtt'); //import mqtt package
const readline = require('readline'); //import readline to get input & output
const MQTT_BROKER = "192.168.203.116" //chan's ip 
const MQTT_PORT = 1883 //broker's port num
const publisher = mqtt.connect(`mqtt://${MQTT_BROKER}:${MQTT_PORT}`) //connection
const message = {};

const r = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});


function registerDevice(DID) {
    if (!message[DID]) {
        message["DEVICE_ID"] = DID; //DID 등록
        console.log(`${DID} register complete`);
    } else {
        console.log(`${DID} is alerady registered`);
    }
}

function askDID() {
    r.question('what is DID?', (DID) => {
        registerDevice(DID);  //DID 등록
    });
}

function checkLED() {
    r.question('Does device have LED? (y/n)', (ans)=>{
        if(ans === 'y'){
            
        }else if(ans === 'n'){

        }else{
            console.log('wrong format reply');
            checkLED();
        }
    });
}

function printMessage() {
    console.log(message);
}

function main() {
    //DID 입력 || quit
    askDID();

    //LED 존재 여부
    checkLED();

    //LED 기기 수
    //수 만큼 반복
    //기기 이름 || 기기 state
    //CURTAIN LED랑 비슷하게 

    r.on('close', () => {
        console.log('프로그램 종료');
    });
}

if (require.main === module) {
    main();
}