const axios = require("axios");
const { analysisUrl } = require("../config");

async function sendPause() {
  try {
    const response = await axios({
      method: "get",
      url: `http://${analysisUrl}/pause`,
      responseType: "json",
      timeout: 5000,
    });

    if (response.status === 200) {
      return true;
    } else return false;
  } catch (err) {
    return false;
  }
}

async function sendShutdown() {
  try {
    const response = await axios.get(`http://${analysisUrl}/shutdown`);
  } catch (err) {
    console.log(err);
  }
}

async function sendRelease(id) {
  try {
    const response = await axios.get(`http://${analysisUrl}/release/${id}`);
  } catch {}
}

async function initChannels(data) {
  try {
    const response = await axios.post(`http://${analysisUrl}/channels`, data);
  } catch {}
}

async function initChannel(id, data) {
  try {
    const response = await axios.post(
      `http://${analysisUrl}/channels/${id}`,
      data
    );
  } catch {}
}

module.exports = {
  sendPause,
  sendShutdown,
  sendRelease,
  initChannels,
  initChannel,
};
