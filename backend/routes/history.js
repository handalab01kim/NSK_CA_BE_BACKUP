const express = require("express");
const pool = require("../module/query");
const router = express.Router();
const {
  sendEventMessage,
  sendEventAlarm,
  sendAlarmMessage,
} = require("../module/socket");
const { sendRelease } = require("../module/fetchAPI");

const dateFormatterForDate = (date) =>
  new Date(date)
    .toLocaleString("ko-KR", {
      timeZone: "Asia/Seoul",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    })
    .replace(". ", "-")
    .replace(". ", "-")
    .replace(". ", " ")
    .replace(/\.|,/g, "");

router.post("/", async (req, res) => {
  const client = await pool.connect();
  try {
    let st_time = new Date(req.body.start + "T00:00:00+09:00");
    let end_time = new Date(req.body.end + "T23:59:59.999+09:00");

    await client.query(
      `SELECT idx, id AS locate, time AS timezone, log_level, log_msg 
             FROM channellog 
             WHERE time >= $1 AND time <= $2 
             UNION 
             SELECT idx, id AS locate, time AS timezone, log_level, log_msg 
             FROM systemlog 
             WHERE time >= $1 AND time <= $2`,
      [st_time, end_time],
      (error, results) => {
        if (error) {
          console.log(error);
          res.status(501).json({
            message: "히스토리 조회 오류",
          });
        } else {
          const formattedResults = results.rows.map((row) => ({
            ...row,
            timezone: dateFormatterForDate(row.timezone),
          }));
          res.status(200).json(formattedResults);
        }
      }
    );
  } catch (e) {
    res.status(500).json({
      error: `서버 내부 동작 중 오류가 발생`,
    });
  }
  client.release();
});

router.get("/:id", async (req, res) => {
  const client = await pool.connect();
  try {
    const id = req.params.id;
    await client.query(
      `SELECT id, time AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Seoul', log_level, log_msg FROM channellog WHERE id = $1 ORDER BY time DESC LIMIT 1`,
      [id],
      (error, results) => {
        if (error) {
          res.status(501).json({
            message: "채널 마지막 이벤트 조회 오류",
          });
        } else {
          const formattedResults = results.rows.map((row) => ({
            ...row,
            timezone: dateFormatterForDate(row.timezone),
          }));
          res.status(200).json(formattedResults);
        }
      }
    );
    await client.query("COMMIT");
  } catch (e) {
    res.status(500).json({
      message: `서버 내부 동작 중 오류가 발생`,
    });
  } finally {
    client.release();
  }
});

// front 요청
router.put("/", async (req, res) => {
  const client = await pool.connect();
  const id = req.body.id;
  const time = req.body.time;
  const level = req.body.level;
  const msg = req.body.message;

  const data = JSON.stringify({
    channel: id,
    time: time,
    type: level,
    // message: msg.split(':')[0],
    message: msg,
  });
  console.log(data);

  try {
    // console.log("MY_DEBUG_TEST1");
    pool.query(`update channelstatus set status = $1 where id = $2`, [
      level,
      id,
    ]);
  } catch (e) {
    console.error(e);
  }
  if (level == "occur") {
    try {
      pool.query(`update channelstatus set message = $1 where id = $2`, [
        msg.split(":")[0],
        id,
      ]);
    } catch (e) {
      console.error(e);
    }
  } else if (level == "activate") {
    try {
      pool.query(`update channelstatus set message = $1 where id = $2`, [
        "",
        id,
      ]);
    } catch (e) {
      console.error(e);
    }
  }

  sendEventMessage(id, data)
    .then(() => {
      client.query(
        "INSERT INTO systemlog (id, time, log_level, log_msg) VALUES ($1, $2, $3, $4)",
        [id, time, level, msg],
        (error, results) => {
          if (error) {
            res.status(501).json({
              message: "시스템 로그 삽입 쿼리 오류",
            });
            console.log(error);
          } else {
            res.status(200).send();
          }
        }
      );
    })
    .catch((err) => {
      console.log("Error: ", err);
      res.status(502).send();
    });

  if (level === "occur") {
    // sendEventAlarm('ON');
  } else {
    if (/^CH\d{2}$/.test(id)) {
      sendRelease(id);
    }
    // sendEventAlarm('OFF');
  }

  client.release();
});

// 사용하지 않음
router.put("/:id", async (req, res) => {
  const client = await pool.connect();
  const id = req.params.id;
  const time = req.body.time;
  const level = req.body.level;
  const msg = req.body.message;

  const data = JSON.stringify({
    channel: id,
    time: time,
    type: level,
    message: msg.split(":")[0],
  });

  try {
    // console.log("MY_DEBUG_TEST2");
    pool.query(`update channelstatus set status = $1 where id = $2`, [
      level,
      id,
    ]);
  } catch (e) {
    console.error(e);
  }
  if (level == "occur") {
    try {
      pool.query(`update channelstatus set message = $1 where id = $2`, [
        msg.split(":")[0],
        id,
      ]);
    } catch (e) {
      console.error(e);
    }
  } else if (level == "activate") {
    try {
      pool.query(`update channelstatus set message = $1 where id = $2`, [
        "",
        id,
      ]);
    } catch (e) {
      console.error(e);
    }
  }

  sendAlarmMessage(id, data)
    .then(() => {
      client.query(
        "INSERT INTO channellog (id, time, log_level, log_msg) VALUES ($1, $2, $3, $4)",
        [id, time, level, msg],
        (error, results) => {
          if (error) {
            res.status(501).json({
              message: "채널 로그 삽입 쿼리 오류",
            });
          } else {
            res.status(200).send();
          }
        }
      );
    })
    .catch((err) => {
      res.status(502).send();
    });

  if (level === "occur") {
    // sendEventAlarm('ON');
  } else {
    sendRelease(id);
    // sendEventAlarm('OFF');
  }
  client.release();
});

module.exports = router;
