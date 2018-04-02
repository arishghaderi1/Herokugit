const express = require("express");
const router = express.Router();
const database = require("../db.js");

router.get("/claims/:companyId", (req, res, next) => {
  let appData = {};
  const id = req.params.companyId;
  database.connection.getConnection(function(err, connection) {
    if (err) {
      appData["error"] = 1;
      appData["data"] = "Internal Server Error";
      res.status(500).json(appData);
    } else {
      connection.query(
        "SELECT users.name, users.id as user_id, claims.* FROM users, claims WHERE users.id = claims.user_id AND claims.company_id = ?",
        id,
        function(err, rows, fields) {
          if (err) {
            appData.error = 1;
            appData["data"] = err;
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

router.patch("/updateClaim", (req, res, next) => {
  let appData = {};
  const data = {
    actionRequired: req.body.actionRequired,
    confirmEmployment: req.body.confirmEmployment,
    confirmNoise: req.body.confirmNoise,
    user_id: req.body.userId
  };
  database.connection.getConnection(function(err, connection) {
    if (err) {
      appData["error"] = 1;
      appData["data"] = "Internal Server Error";
      res.status(500).json(appData);
    } else {
      connection.query(
        "UPDATE claims SET actionrequired = ?, confirmemployement = ?, confirmnoise = ? WHERE user_id = ?",
        [
          data.actionRequired,
          data.confirmEmployment,
          data.confirmNoise,
          data.user_id
        ],
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
