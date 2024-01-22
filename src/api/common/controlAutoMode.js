const mqtt = require('../../../app');
const controlDeviceValue = require('./controlDeviceValue');
const goalValue = 80;
let autoModeActive = true;

const stopAutoMode = async() => {
    autoModeActive = false;
    console.log("Auto mode has been stopped.");
    //멈춘 후 어떻게 정보를 가져올지 고민...
};

const controlAutoMode = async(devices) => {
    while(autoModeActive){
        const SID = findSensor(devices); //toppic 호출을 위한 SID 필요 
        const deviceList = findDevices(devices); //sensor를 제외한 기기 리스트 필요
        const MQTT_TOPIC = `sensor/${SID}`;

        const messageHandler = (topic, message) => {
            try {
                 const parsedMessage = JSON.parse(message.toString());
                 for(device of deviceList){
                    let deviceValue = findCurrentDeviceValue(device.deviceId); //현재 디비에 등록된 value값을 알고 있어야 함
                    if(parsedMessage.sensor_value > goal)
                        controlDeviceValue(device.deviceId, deviceValue, deviceValue-1); //센서값이 크므로 밝기를 줄여야 함
                    else if(parsedMessage.sensor_value < goal)
                        controlDeviceValue(device.deviceId, deviceValue, deviceValue+1); //센서값이 작으므로 밝키를 키워야 함
                    else
                        continue;
                 }
            } catch (error) {
                console.log("subscribing sensor has an error");
            }
        };
        mqtt.client.subscribe(MQTT_TOPIC);
        mqtt.client.on('meesage', messageHandler);
    }
    mqtt.client.unsubscribe(MQTT_TOPIC);  
};

// 이벤트 리스너 설정
document.addEventListener('click', () => {
    // 조건 확인
    if (checkTriggerCondition()) {
        console.log("트리거 조건 만족, 콜백 중단");
        // 이벤트 리스너 제거
        document.removeEventListener('click', myCallback);
    } else {
        // 조건 미달시 콜백 함수 실행
        myCallback();
    }
});
// 콜백 함수 등록 및 중단
// 해당 로직에서는 콜백 함수 , 트리거 , 이벤트 리스너가 필요
// 그러므로 중지 요청이 들어오면 막을 수 있음
// 콜백 함수 정의 밑에 예시 참고
// goal_value와 device 기기를 받아옴
// 먼저 sensor 토픽을 subscribe 받아옴
// 조도 센서 값과 goal_value를 같게 해주기 위해
// 무한 반복으로 +- 연산해줘서 controldevice해줌
// 트리거 요청이 들어올 때까지 계속 반복


module.exports = {
    controlAutoMode,
    stopAutoMode
};
