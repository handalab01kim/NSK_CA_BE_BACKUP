const net = require('net');
const WebSocket = require('ws');

function createSocketStream(id, port) {
    const PORT = 5001;
    let imageBuffer = Buffer.alloc(0);

    const wss = new WebSocket.Server({ port: port });

    wss.on('connection', (ws) => {
        console.log(`CH03 Client connected. ${wss.clients.size}`);

        const sendImageInterval = setInterval(() => {
            if (imageBuffer) {
                ws.send(imageBuffer.toString('base64')); // 이미지 데이터를 base64로 인코딩하여 전송
            }
        }, 100);

        ws.on('close', () => {
            console.log('CH03 Client disconnected');
            clearInterval(sendImageInterval);
        });
    });

    const server = net.createServer((socket) => {

        // 데이터 수신을 위한 버퍼
        let buffer = Buffer.alloc(0);
        let imageSize = null;

        // 데이터 수신 이벤트
        socket.on('data', (data) => {
            // console.log("data" , data)
            // 수신된 데이터를 버퍼에 추가
            buffer = Buffer.concat([buffer, data]);

            // 처음 수신 시 이미지 크기 확인
            if (imageSize === null && buffer.length >= 4) {
                // 버퍼의 처음 4바이트에서 이미지 크기를 읽음
                imageSize = buffer.readUInt32BE(0);
                // console.log('Image size:', imageSize);
            }

            // 전체 이미지 데이터가 수신되었는지 확인
            if (imageSize !== null && buffer.length >= imageSize + 4) {
                const imageData = buffer.slice(4, 4 + imageSize);
                imageBuffer = imageData;
                socket.end();
            }
        });

        // 연결 종료 이벤트
        socket.on('end', () => {

        });

        // 에러 이벤트
        socket.on('error', (err) => {
            console.error('Socket error:', err);
        });
    });

    // 서버 리스닝
    server.listen(PORT, () => {
        console.log(`Socket Server is running on port 9993`);
    });
}

module.exports = {
    createSocketStream,
};
