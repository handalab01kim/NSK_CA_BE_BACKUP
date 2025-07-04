const Stream = require('node-rtsp-stream');
const pool = require('./query');

const { initChannel } = require('./fetchAPI');
const e = require('express');
const { exec } = require("child_process");

// 해상도 점검 func
const getStreamResolution = (rtspUrl) => {
    return new Promise((resolve, reject) => {
        const cmd = `ffprobe -v error -rtsp_transport tcp -timeout 5000000 -select_streams v:0 -show_entries stream=width,height -of csv=p=0 "${rtspUrl}"`;

        // const cmd = `ffprobe -v error -select_streams v:0 -show_entries stream=width,height -of csv=p=0 "${rtspUrl}"`;
        exec(cmd, (err, stdout, stderr) => {
            if (err) {
                reject(`ffprobe error: ${stderr}`);
                return;
            }
            const [width, height] = stdout.trim().split(',').map(Number);
            if (isNaN(width) || isNaN(height)) {
                reject("Unable to parse resolution");
            } else {
                resolve({ width, height });
            }
        });
    });
};


async function createRtspStream(name, url, port) {
    var rtspObj = {};
    rtspObj.url = url;
    rtspObj.name = name;
    rtspObj.stream = null;
    rtspObj.port = port;
    rtspObj.lastData = null;
    rtspObj.intervalId = 0;

    var isConn = true;
    var connCnt = 0;

    await startStream(rtspObj);

    var timer = setInterval(
        function (obj) {
            obj.intervalId = timer;
            var today = new Date();
            if (obj.lastData !== undefined) {
                var stream_data = new Date(obj.lastData);
                var emptyTime = (today.getTime() - stream_data.getTime()) / 1000;

                if (emptyTime >= 10) {
                    obj.stream.stop();
                    isConn = false;
                    startStream(obj);
                    connCnt = 0;
                } else {
                    connCnt++;
                }
                if (connCnt > 20) {
                    if (isConn === false) {
                        isConn = true;
                        initChannelInfo(name);
                        connCnt = 0;
                    } else if (isConn === true) {
                        connCnt = 0;
                    }
                }
            }
        },
        1000,
        rtspObj
    );
}

async function initChannelInfo(id) {
    const client = await pool.connect();
    client.query(`SELECT * FROM channelinfo WHERE channel_id = $1`, [id], (error, results) => {
        if (error) {
            console.log(error);
        } else {
            const data = results.rows[0];
            initChannel(id, data);
        }
    });
    client.release();
}

async function startStream(obj) {
    const { width, height } = await getStreamResolution(obj.url);
    // let width=1280;
    // let height=720;
    // if(obj.port===9995 || obj.port===9996){
        // width=640;
        // height=480;
    // }
    console.log("Stream - port:", obj.port, ", width: ", width, ", height: ", height);
    stream = new Stream({
        name: obj.name,
        streamUrl: obj.url,
        wsPort: obj.port,
        // width: 640,
        // height: 480,
        // width: width,
        // height: height,
        width: width,
        height: height,
    });
    obj.stream = stream;

    stream.mpeg1Muxer.on('ffmpegStderr', (data) => {
        var today = new Date();
        obj.lastData = today;
    });
}

async function setChannelStatus(){
    setTimeout(()=>{
        try{
            pool.query(`update channelstatus set status='activate', message='' where status='standby';`);
        }catch(e){
            console.log("ERROR:",e);
        }
    }, 4000);
}

module.exports = {
    createRtspStream,
    setChannelStatus,
};
