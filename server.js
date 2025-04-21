const WebSocket = require('ws');

// WebSocket 서버 생성 (포트 8080)
const wss = new WebSocket.Server({ port: 8080 });

// 연결된 모든 클라이언트를 저장할 Set
const clients = new Set();

// 서버 시작 메시지
console.log('WebSocket 서버가 시작되었습니다. (포트: 8080)');

// 새로운 클라이언트 연결 처리
wss.on('connection', (ws) => {
    // 클라이언트 추가
    clients.add(ws);
    console.log('새로운 클라이언트가 연결되었습니다.');

    // 클라이언트로부터 메시지 수신
    ws.on('message', (message) => {
        console.log('수신된 메시지:', message.toString());

        // 모든 클라이언트에게 메시지 브로드캐스트
        clients.forEach((client) => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(message.toString());
            }
        });
    });

    // 클라이언트 연결 종료 처리
    ws.on('close', () => {
        clients.delete(ws);
        console.log('클라이언트 연결이 종료되었습니다.');
    });

    // 에러 처리
    ws.on('error', (error) => {
        console.error('WebSocket 에러:', error);
        clients.delete(ws);
    });
}); 