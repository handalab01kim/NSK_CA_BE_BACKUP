const express = require('express');
const router = express.Router();
const { logCpuUsage, logMemoryUsage, logNetworkUsage, isServerReady } = require('../module/resourse.js');

router.get('/', async (req, res) => {
    try {
        let ssdUsage = 0;
        const cpuUsage = logCpuUsage();
        const memUsage = logMemoryUsage();
        const status = await isServerReady();

        await logNetworkUsage().then((value) => {
            ssdUsage = value;
        });

        const result = {
            cpu: cpuUsage,
            mem: memUsage,
            net: ssdUsage,
            status: status,
        };
        res.status(200).json(result);
    } catch (e) {
        console.log(e);
        res.status(500).json({
            message: `서버 내부 동작 중 오류가 발생`,
        });
    }
});

module.exports = router;
