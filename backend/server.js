const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const historyRoute = require('./routes/history');
const userInfoRoute = require('./routes/userInfo');
const channelInfoRoute = require('./routes/channelInfo');
const channelStatusoRoute = require('./routes/channelStatus');
const systemInfoRoute = require('./routes/systemInfo');
const streamCaptureRoute = require('./routes/streamCapture');
const { checkServer } = require('./module/revivalServer');
const { createRtspStream, setChannelStatus } = require('./module/rtspServer');
const { createSocketStream } = require('./module/socketServer');

const { sendEventAlarm } = require('./module/socket');
const { backendUrl } = require('./config');

const path = require("path");
const fs = require("fs");

const app = express();

process.on("uncaughtException", (err) => {
  console.error("Uncaught Exception:", err.message);
  // optionally: process.exit(1);
});

app.use(express.static(path.join(__dirname, "public", "build")));

app.use(bodyParser.json());
app.use(
    bodyParser.urlencoded({
        extended: true,
    })
);
app.use(cors('*'));

app.listen(5000, () => {
    console.log(`Server Start : http://${backendUrl}`);
});

app.use('/apis/history', historyRoute);
app.use('/apis/userInfo', userInfoRoute);
app.use('/apis/channelInfo', channelInfoRoute);
app.use('/apis/channelStatus', channelStatusoRoute);
app.use('/apis/systemInfo', systemInfoRoute);
app.use('/apis/capture', streamCaptureRoute);

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, "public", "build", "index.html"));
});

checkServer();

createRtspStream('CH01', 'rtsp://admin:handa1007!@192.168.1.11:554/Streaming/Channels/102', 9991);
createRtspStream('CH02', 'rtsp://admin:handa1007!@192.168.1.12:554/Streaming/Channels/102', 9992);
createRtspStream('CH03', 'rtsp://admin:handa1007!@192.168.1.13:554/Streaming/Channels/102', 9993);
createRtspStream('CH04', 'rtsp://192.168.1.14:554/stream2', 9994);
createRtspStream('CH05', 'rtsp://192.168.1.15:554/stream2', 9995);
createRtspStream('CH06', 'rtsp://192.168.1.16:554/stream2', 9996);

setChannelStatus();

