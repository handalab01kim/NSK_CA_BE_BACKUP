const axios = require('axios');
const { initChannels, initChannel } = require('./fetchAPI');
const { analysisUrl, backendUrl } = require('../config');

const checkServerStatus = async (url, interval, timeout) => {
    const startTime = Date.now();

    // 서버 상태를 확인하는 함수
    const isServerReady = async () => {
        try {
            // GET 요청을 통해 서버 상태 확인
            const response = await axios({
                method: 'get',
                url: url,
                responseType: 'json',
            });
            if (response.status === 200) {
                return true;
            }
        } catch (error) {}
        return false;
    };

    // 서버가 준비될 때까지 기다리는 함수
    const waitForServer = async () => {
        while (Date.now() - startTime < timeout) {
            const ready = await isServerReady();
            if (ready) {
                return true;
            }
            // 서버가 준비되지 않았으면 interval 만큼 대기
            await new Promise((resolve) => setTimeout(resolve, interval));
        }

        return false;
    };

    return await waitForServer();
};

const checkServer = async () => {
    const serverStatusUrl = `http://${analysisUrl}/status`; // 서버 상태를 확인할 URL
    const checkInterval = 5000; // 서버 상태 확인 간격 (ms)
    const timeout = 100000; // 서버 준비 대기 시간 (ms)
    try {
        const isReady = await checkServerStatus(serverStatusUrl, checkInterval, timeout);
        if (isReady) {
            const response = await axios({
                method: 'get',
                url: `http://${backendUrl}/apis/channelInfo`,
                responseType: 'json',
            });

            await initChannels(response.data);

        } else {
        }
    } catch (e){
        console.log("checkServer failed! ", e);
    }
};

module.exports = { checkServer };
