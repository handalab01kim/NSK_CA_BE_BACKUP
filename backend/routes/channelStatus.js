const express = require("express");
const pool = require("../module/query");
const router = express.Router();
const axios = require("axios");
const { analysisUr2 } = require("../config");

router.get("/", async (req, res) => {
  try {
    await pool.query(
      `SELECT * FROM channelstatus ORDER BY id ASC`,
      (error, results) => {
        if (error) {
          res.status(501).json({
            message: "채널정보조회 오류",
          });
        }
        res.status(200).json(results.rows);
      }
    );

  } catch (e) {
    res.status(500).json({
      message: `서버 내부 동작 중 오류가 발생`,
      error: e,
    });
  }
});

module.exports = router;
