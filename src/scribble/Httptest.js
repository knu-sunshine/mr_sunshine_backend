const express = require('express');
const app = express();
const port = 3000;

// 미들웨어 설정 (예: JSON 파싱)
app.use(express.json());

// 라우트 정의
app.get('/', (req, res) => {
  res.send('안녕하세요, Express.js로 만든 서버입니다!');
});

app.post('/api/data', (req, res) => {
  // POST 요청에서 데이터를 받아옴
  const requestData = req.body;

  // 받아온 데이터를 처리하고 응답
  res.json({ message: '데이터를 성공적으로 받았습니다.', data: requestData });
});

// 서버 시작
app.listen(port, () => {
  console.log(`서버가 http://localhost:${port} 에서 실행 중입니다.`);
});
