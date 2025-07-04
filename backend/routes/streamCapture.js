const express = require('express');
const pool = require('../module/query');
const { spawn } = require('child_process');
const router = express.Router();

router.post('/:id', async (req, res) => {
    const id = req.params.id;
    const client = await pool.connect();
    await client.query(`SELECT rtsp_url FROM channelinfo WHERE channel_id = $1`, [id], (error, results) => {
        if (error) {
            console.log(error);
            res.status(501).json({
                message: '채널정보조회 오류',
            });
        } else {
            const url = results.rows[0]['rtsp_url'];
            if (url) {
                const ffmpeg = spawn('ffmpeg', [
                    '-rtsp_transport',
                    'tcp', // RTSP를 TCP로 전송
                    '-i',
                    url, // RTSP 스트림 URL
                    '-frames:v',
                    '1', // 한 프레임만 캡처
                    '-q:v',
                    '2', // 이미지 품질 설정
                    '-f',
                    'image2pipe', // 이미지를 파이프로 출력
                    '-vcodec',
                    'mjpeg', // 이미지 코덱 설정 (JPEG)
                    'pipe:1', // 표준 출력으로 보냄
                ]);
                res.contentType('image/jpeg');
                ffmpeg.stdout.pipe(res);
            }
        }
    });
    client.release();
});

module.exports = router;
