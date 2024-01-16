import paho.mqtt.publish as publish
import json

MQTT_BROKER = "192.168.203.118" # 내 맥북 IP
MQTT_PORT = 1883

devices = {}

def register_device(device_id):
    if device_id not in devices:
        devices[device_id] = []
        print(f"{device_id} 등록 완료.")
    else:
        print(f"{device_id}는 이미 등록된 디바이스입니다.")

def remove_device(device_id):
    if device_id in devices:
        del devices[device_id]
        print(f"{device_id} 삭제 완료.")
    else:
        print(f"{device_id}는 등록되지 않은 디바이스입니다.")

def add_device_feature(device_id, feature):
    if device_id in devices:
        devices[device_id].append(feature)
        print(f"{feature}가 {device_id}에 추가되었습니다.")
    else:
        print(f"{device_id}는 등록되지 않은 디바이스입니다.")

def remove_device_feature(device_id, feature):
    if device_id in devices and feature in devices[device_id]:
        devices[device_id].remove(feature)
        print(f"{feature}가 {device_id}에서 삭제되었습니다.")
    else:
        print(f"{device_id}에 {feature}가 존재하지 않습니다.")
        
def send_command(device_id, command):
    if device_id in devices:
        MQTT_TOPIC = f"device/{device_id}"
        message = json.dumps(command)
        publish.single(MQTT_TOPIC, message, hostname=MQTT_BROKER, port=MQTT_PORT)
    else:
        print(f"{device_id}는 등록되지 않은 디바이스입니다.")

def main():
    register_device("ABC")
    add_device_feature("ABC", "LED1")
    while True:
        print("\n명령어를 입력하세요 (예: send ABC turn_on LED1, quit)")
        user_input = input("> ").strip()
        
        if user_input == "quit":
            break
        
        try:
            parts = user_input.split(" ")
            command_type = parts[0]

            if command_type == "send" and len(parts) == 4:
                device_id, action, device = parts[1], parts[2], parts[3]
                send_command(device_id, {"action": action, "device": device})
            else:
                print("잘못된 명령어 형식입니다.")
        except Exception as e:
            print(f"오류 발생: {e}")

# 예시 사용을 위한 코드 실행
if __name__ == "__main__":
    main()