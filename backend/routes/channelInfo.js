const express = require("express");
const pool = require("../module/query");
const router = express.Router();
const axios = require("axios");
const { analysisUr2 } = require("../config");

// axios.defaults.timeout = 2000;

router.get("/", async (req, res) => {
  try {
    const client = await pool.connect();
    await client.query(
      `SELECT * FROM channelinfo ORDER BY channel_id ASC`,
      (error, results) => {
        if (error) {
          res.status(501).json({
            message: "채널정보조회 오류",
          });
        }
        res.status(200).json(results.rows);
      }
    );

    client.release();
  } catch (e) {
    res.status(500).json({
      message: `서버 내부 동작 중 오류가 발생`,
      error: e,
    });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const client = await pool.connect();
    await client.query(
      `SELECT * FROM channelinfo WHERE channel_id = $1`,
      [id],
      (error, results) => {
        if (error) {
          res.status(501).json({
            message: "단일 채널정보조회 오류",
          });
        } else {
          res.status(200).json(results.rows);
        }
      }
    );

    client.release();
  } catch (e) {
    console.log(e);
    res.status(500).json({
      message: "서버 내부 동작 중 오류가 발생",
    });
  }
});

router.post("/:id", async (req, res) => {
  const client = await pool.connect();

  const id = req.params.id;
  const name = req.body.channel_name;
  const desc = req.body.description;
  const url = req.body.rtsp_url;
  const roi = req.body.channel_roi;
  const thresh_px = req.body.threshold_pixel;
  const thresh_t = req.body.threshold_time;

  await axios
    .post(`http://${analysisUr2}/channels/${id}`, {
      channel_id: id,
      channel_name: name,
      description: desc,
      rtsp_url: url,
      channel_roi: roi,
      threshold_pixel: thresh_px,
      threshold_time: thresh_t,
    })
    .then(() => {
      client.query(
        `UPDATE channelinfo SET channel_id = $1, channel_name = $2, description = $3, rtsp_url = $4, channel_roi = $5, threshold_pixel = $6, threshold_time = $7 WHERE channel_id = $1`,
        [id, name, desc, url, roi, thresh_px, thresh_t],
        (error, results) => {
          if (error) {
            res.status(501).json({
              message: "데이터저장을 실패하였습니다.",
            });
          } else {
            res.status(200).json({
              channel_id: id,
              channel_name: name,
              description: desc,
              rtsp_url: url,
              channel_roi: roi,
              threshold_pixel: thresh_px,
              threshold_time: thresh_t,
            });
          }
        }
      );
    })
    .catch((error) => {
      if (error.code === "ECONNABORTED") {
        res.status(500).json({
          message: "분석서버로부터 응답이 없습니다.",
        });
      } else {
        res.status(500).json({
          message: "분석서버로부터 응답이 없습니다.",
        });
      }
    });
  client.release();
});

module.exports = router;
