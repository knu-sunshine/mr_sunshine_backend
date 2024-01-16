const mqtt = require('mqtt');

const MQTT_BROKER = "192.168.203.116" 
const MQTT_PORT = 1883

const subscriber = mqtt.connect(`mqtt://${MQTT_BROKER}:${MQTT_PORT}`)

subscriber.subscribe('test');
subscriber.on('message', function(topic, message){
    console.log(`토픽: ${topic.toString()}, 메시지: ${message.toString()}`);
})
