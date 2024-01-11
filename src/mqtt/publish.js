const mqtt = require('mqtt'); //import mqtt package
const readline = require('readline'); //import readline to get input & output
const MQTT_BROKER = "192.168.203.116" //chan's ip 
const MQTT_PORT = 1883 //broker's port num
const publisher = mqtt.connect(`mqtt://${MQTT_BROKER}:${MQTT_PORT}`) //connection
const devices = {};

function registerDevice(deviceId) {
    if (!devices[deviceId]) {
        devices[deviceId] = [];
        console.log(`${deviceId} 등록 완료.`);
    } else {
        console.log(`${deviceId}는 이미 등록된 디바이스입니다.`);
    }
}

function removeDevice(deviceId) {
    if (devices[deviceId]) {
        delete devices[deviceId];
        console.log(`${deviceId} 삭제 완료.`);
    } else {
        console.log(`${deviceId}는 등록되지 않은 디바이스입니다.`);
    }
}

function addDeviceFeature(deviceId, feature) {
    if (devices[deviceId]) {
        devices[deviceId].push(feature);
        console.log(`${feature}가 ${deviceId}에 추가되었습니다.`);
    } else {
        console.log(`${deviceId}는 등록되지 않은 디바이스입니다.`);
    }
}

function removeDeviceFeature(deviceId, feature) {
    if (devices[deviceId] && devices[deviceId].includes(feature)) {
        const index = devices[deviceId].indexOf(feature);
        devices[deviceId].splice(index, 1);
        console.log(`${feature}가 ${deviceId}에서 삭제되었습니다.`);
    } else {
        console.log(`${deviceId}에 ${feature}가 존재하지 않습니다.`);
    }
}

function sendCommand(deviceId, command) {
    if (devices[deviceId]) {
        const MQTT_TOPIC = `device/${deviceId}`;
        const message = JSON.stringify(command);
        publisher.publish(MQTT_TOPIC, message);
    } else {
        console.log(`${deviceId}는 등록되지 않은 디바이스입니다.`);
    }
}

function main() {
    while (true) {
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });

        rl.question('당신의 이름은 무엇인가요? ', (answer) => {
            // 사용자의 입력 처리
            console.log(`안녕하세요, ${answer}님!`);
            if (input === 'quit') {
                break;
                rl.close(); // 인터페이스 종료
            }
        });

    }


    // rl.on('line', (input) => {
    //     console.log('DID를 입력해주세요');
    //     if (input === 'quit') {
    //         rl.close();
    //         publisher.end();
    //     } else {
    //         try {
    //             const parts = input.split(" ");
    //             const commandType = parts[0];

    //             if (commandType === "send" && parts.length === 4) {
    //                 const deviceId = parts[1];
    //                 const action = parts[2];
    //                 const device = parts[3];
    //                 sendCommand(deviceId, { action: action, device: device });
    //             } else {
    //                 console.log("잘못된 명령어 형식입니다.");
    //             }
    //         } catch (e) {
    //             console.error(`오류 발생: ${e}`);
    //         }
    //     }
    // });

    rl.on('close', () => {
        console.log('프로그램 종료');
    });
}

if (require.main === module) {
    main();
}