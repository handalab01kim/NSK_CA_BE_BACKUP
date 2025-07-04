const pool = require('./query');
const net = require('net');

const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const { analysisUr3 } = require('../config');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST'],
    },
});

app.get('/', (req, res) => {
    res.send('Socket.IO server is running.');
});

io.on('connection', (socket) => {
    // console.log('a user connected', socket.id);

    socket.on('disconnect', () => {
        // console.log('user disconnected');
    });
});

server.listen(5002);

const sendEventMessage = (id, data) => {
    return new Promise((resolve, reject) => {
        try {
            io.emit(id, data);
            // io.emit('alarm', data);
            resolve(data);
        } catch (e){
            reject("sendEventMessage-error:"+e);
        }
    });
};

const sendAlarmMessage = (id, data) => {
    return new Promise((resolve, reject) => {
        try {
            io.emit(id, data);
            resolve();
        } catch {
            reject();
        }
    });
};

const sendEventAlarm = async (data) => {
    const pg = await pool.connect();
    pg.query(`SELECT alarm_sound FROM userinfo`, (error, results) => {
        if (error) {
        } else {
            var result = results.rows[0]['alarm_sound'];
            const client = net.createConnection({ host: analysisUr3, port: 5004 }, () => {
                if (data == 'ON' && result) {
                    client.write(Buffer.from([0x57, 0x00, 0x02, 0x00, 0x00, 0x00, 0x00, 0x01, 0x00, 0x00]));
                } else if (data == 'ON' && !result) {
                    client.write(Buffer.from([0x57, 0x00, 0x02, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00]));
                } else {
                    client.write(Buffer.from([0x57, 0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x00, 0x00]));
                }
            });
            client.on('error', (err) => {
                console.log(err);
            });
        }
    });
    pg.release();
};

module.exports = {
    sendEventMessage,
    sendEventAlarm,
    sendAlarmMessage,
};
