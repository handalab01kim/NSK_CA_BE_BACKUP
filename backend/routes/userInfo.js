const express = require('express');
const pool = require('../module/query');
const router = express.Router();

router.get('/', async (req, res) => {
    try {
        const client = await pool.connect();
        await client.query(`SELECT * FROM userinfo`, (error, results) => {
            if (error) {
                res.status(501).json({
                    message: 'User정보조회 오류',
                });
            }
            res.status(200).json(results.rows);
        });

        client.release();
    } catch (e) {
        res.status(500).json({
            error: `서버 내부 동작 중 오류가 발생`,
        });
        // console.log(e);
    }
});

router.post('/language', async (req, res) => {
    try {
        const lang = req.body.language;
        const client = await pool.connect();
        await client.query(`UPDATE userinfo SET language = $1`, [lang], (error, results) => {
            if (error) {
                res.status(501).json({
                    message: 'User정보 갱신 오류',
                });
            }
            res.status(200).json({
                message: 'User정보 갱신 완료',
            });
        });

        client.release();
    } catch (e) {
        res.status(500).json({
            error: `서버 내부 동작 중 오류가 발생. ${e}`,
        });
    }
});

router.post('/theme', async (req, res) => {
    try {
        const theme = req.body.theme;
        const client = await pool.connect();
        await client.query(`UPDATE userinfo SET theme = $1`, [theme], (error, results) => {
            if (error) {
                res.status(501).json({
                    message: 'User정보 갱신 오류',
                });
            }
            res.status(200).json({
                message: 'User정보 갱신 완료',
            });
        });

        client.release();
    } catch (e) {
        res.status(500).json({
            error: `서버 내부 동작 중 오류가 발생. ${e}`,
        });
    }
});

router.post('/sound', async (req, res) => {
    try {
        const sound = req.body.sound;
        const client = await pool.connect();
        await client.query(`UPDATE userinfo SET alarm_sound = $1`, [sound], (error, results) => {
            if (error) {
                res.status(501).json({
                    message: 'User정보 갱신 오류',
                });
            }
            res.status(200).json({
                message: 'User정보 갱신 완료',
            });
        });

        client.release();
    } catch (e) {
        res.status(500).json({
            error: `서버 내부 동작 중 오류가 발생. ${e}`,
        });
    }
});

router.post('/popup', async (req, res) => {
    try {
        const popup = req.body.popup;
        const client = await pool.connect();
        await client.query(`UPDATE userinfo SET alarm_window = $1`, [popup], (error, results) => {
            if (error) {
                res.status(501).json({
                    message: 'User정보 갱신 오류',
                });
            }
            res.status(200).json({
                message: 'User정보 갱신 완료',
            });
        });

        client.release();
    } catch (e) {
        res.status(500).json({
            error: `서버 내부 동작 중 오류가 발생. ${e}`,
        });
    }
});

module.exports = router;
