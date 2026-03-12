const express = require('express');
const app = express();
const port = 9247;

// CORS 허용
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', '*');
    res.header('Access-Control-Allow-Headers', '*');
    next();
});

// 정적 파일 제공을 위한 미들웨어
app.use(express.static('.'));

// 기본 라우트
app.get('/', (req, res) => {
    res.send('서버가 정상적으로 실행 중입니다!');
});

// POST 요청 처리
app.post('/api/data', express.text(), (req, res) => {
    console.log('수신된 데이터:', req.body);
    res.send('데이터를 성공적으로 수신했습니다.');
});

// 서버 시작
app.listen(port, () => {
    console.log(`서버가 http://localhost:${port} 에서 실행 중입니다.`);
}); 