const os = require('os');
const axios = require('axios');
const df = require('node-df');
const { analysisUr2 } = require('../config');

let previousCpuInfo = os.cpus();

// CPU 사용량을 계산하는 함수
function logCpuUsage() {
    // 현재 CPU 시간 정보를 가져옵니다.
    const currentCpuInfo = os.cpus();

    let totalIdleDiff = 0;
    let totalTickDiff = 0;

    currentCpuInfo.forEach((cpu, index) => {
        // 이전과 현재 CPU 시간 정보를 비교합니다.
        const prevCpu = previousCpuInfo[index];
        const prevTimes = prevCpu.times;
        const currTimes = cpu.times;

        // 각 시간의 차이를 계산합니다.
        const idleDiff = currTimes.idle - prevTimes.idle;
        const totalDiff =
            currTimes.user +
            currTimes.nice +
            currTimes.sys +
            currTimes.idle +
            currTimes.irq -
            (prevTimes.user + prevTimes.nice + prevTimes.sys + prevTimes.idle + prevTimes.irq);

        totalIdleDiff += idleDiff;
        totalTickDiff += totalDiff;
    });

    // 총 CPU 사용량을 계산합니다.
    const usage = 1 - totalIdleDiff / totalTickDiff;

    // 현재 CPU 시간을 이전 CPU 시간 정보로 저장합니다.
    previousCpuInfo = currentCpuInfo;

    return (usage * 100).toFixed(2);
}

function logMemoryUsage() {
    const totalMem = os.totalmem();
    const freeMem = os.freemem();
    const usedMem = totalMem - freeMem;
    const usedMemPercentage = (usedMem / totalMem) * 100;

    return usedMemPercentage.toFixed(2);
}

function logNetworkUsage() {
    return new Promise((resolve, reject) => {
        var options = {
            file: '/',
            prefixMultiplier: 'GB',
            isDisplayPrefixMultiplier: false,
            precision: 2,
        };
        df(options, function (error, response) {
            if (error) {
                reject(error);
            }
            let value = response[0].used;
            resolve(value);
        });
    });
}
async function isServerReady() {
    try {
        // GET 요청을 통해 서버 상태 확인
        const response = await axios({
            method: 'get',
            url: `http://${analysisUr2}/status`,
            responseType: 'json',
        });
        if (response.status === 200) {
            return true;
        }
    } catch (error) {
        return false;
    }
}

module.exports = {
    logCpuUsage,
    logMemoryUsage,
    logNetworkUsage,
    isServerReady,
};
