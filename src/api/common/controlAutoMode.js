const mqtt = require('../../../app');

// 콜백 함수 등록 및 중단
// 해당 로직에서는 콜백 함수 , 트리거 , 이벤트 리스너가 필요
// 그러므로 중지 요청이 들어오면 막을 수 있음
// 콜백 함수 정의 밑에 예시 참고
// goal_value와 device 기기를 받아옴
// 먼저 sensor 토픽을 subscribe 받아옴
// 조도 센서 값과 goal_value를 같게 해주기 위해
// 무한 반복으로 +- 연산해줘서 controldevice해줌
// 트리거 요청이 들어올 때까지 계속 반복

// function myCallback() {
//     console.log("콜백 함수 실행됨");
// }

// // 트리거 조건을 체크하는 함수
// function checkTriggerCondition() {
//     // 여기서는 예시를 위해 랜덤한 조건을 사용
//     return Math.random() < 0.5;
// }

// // 이벤트 리스너를 등록하는 함수
// function setupEventListener() {
//     // 이벤트 리스너 설정
//     document.addEventListener('click', () => {
//         // 조건 확인
//         if (checkTriggerCondition()) {
//             console.log("트리거 조건 만족, 콜백 중단");
//             // 이벤트 리스너 제거
//             document.removeEventListener('click', myCallback);
//         } else {
//             // 조건 미달시 콜백 함수 실행
//             myCallback();
//         }
//     });
// }

// // 이벤트 리스너 설정
// setupEventListener();