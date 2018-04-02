const express = require("express");
const router = express.Router();
const database = require("../db.js");

router.get("/claims/:doctorId", (req, res, next) => {
  let appData = {};
  const id = req.params.doctorId;
  database.connection.getConnection(function(err, connection) {
    if (err) {
      appData["error"] = 1;
      appData["data"] = "Internal Server Error";
      res.status(500).json(appData);
    } else {
      connection.query(
        "SELECT users.name, users.id as user_id, claims.* FROM users, claims WHERE users.id = claims.user_id AND claims.doctor_id = ?",
        [id],
        function(err, rows, fields) {
          if (err) {
            appData.error = 1;
            appData["data"] = "Error Occured!";
            res.status(400).json(appData);
          } else {
            res.status(200).json(rows);
          }
        }
      );
      connection.release();
    }
  });
});

router.post("/createClaim", (req, res, next) => {
  let appData = {};
  let data = {
    name: req.body.name,
    email: req.body.email,
    phone: req.body.phone || "",
    view: "employee",
    injurytype: req.body.injury,
    user_id: null
  };
  database.connection.getConnection(function(err, connection) {
    if (err) {
      appData["error"] = 1;
      appData["data"] = "Internal Server Error";
      res.status(500).json(appData);
    } else {
      connection.query(
        "SELECT id FROM users WHERE email = ? LIMIT 1",
        data.email,
        function(err, rows, fields) {
          if (err) {
            console.log("Making New User");
          } else {
            if (rows.length > 0) {
              data.user_id = rows[0].id;
              res.locals.data = data;
              console.log("Sending with found user");
              next();
            } else {
              res.locals.data = data;
              console.log("Sending to make user");
              next();
            }
          }
        }
      );
      connection.release();
    }
  });
});

router.post("/createClaim", (req, res, next) => {
  let appData = {};
  if (res.locals.data.user_id === null) {
    const data = res.locals.data;
    database.connection.getConnection(function(err, connection) {
      if (err) {
        appData["error"] = 1;
        appData["data"] = "Internal Server Error";
        res.status(500).json(appData);
      } else {
        connection.query(
          "INSERT INTO users (name, email, phone) VALUES(?, ?, ?)",
          [data.name, data.email, data.phone],
          function(err, rows, fields) {
            if (err) {
              appData.error = 1;
              appData["data"] = "Error Occured!";
            } else {
              res.locals.data.user_id = rows.insertId;
            }
          }
        );
        connection.release();
      }
    });
  }
  console.log("Sending after second call");
  next();
});

router.post("/createClaim", (req, res, next) => {
  let appData = {};
  console.log("DATA in third call");
  const data = res.locals.data;
  const date = new Date();
  console.log(data);
  database.connection.getConnection(function(err, connection) {
    if (err) {
      appData["error"] = 1;
      appData["data"] = "Internal Server Error";
      res.status(500).json(appData);
    } else {
      connection.query(
        "INSERT INTO claims (created_at, flagged, status, actionrequired, confirminjury, confirmemployement, confirmnoise, injurytype, user_id, company_id) VALUES(?, 0, 'pending', 1, 'null', 'null', 'null', ?, ?, 1)",
        [date, data.injurytype, data.user_id],
        function(err, rows, fields) {
          if (err) {
            appData.error = 1;
            appData["data"] = "Error Occured!";
            res.status(400).json(appData);
          } else {
            res.status(200).json(rows);
          }
        }
      );
      connection.release();
    }
  });
});

module.exports = router;
