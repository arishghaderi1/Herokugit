const express = require("express");
const router = express.Router();
const database = require("../db");

// Time stamp functions for Analytics

// date created stamp
router.post("/Claims", (req, res, next) => {
  let appData = {};
  const claimId = req.body.claimId;
  const nodeNum = req.body.nodeid;
  const action = req.body.action;
  const nullTime = new Date();
  const time = nullTime + ",";
  database.query(
    "UPDATE Claim SET dates = IFNULL(CONCAT(dates, '_STEP::',?,'-',?,'-',?),?) WHERE id = ?",
    [nodeNum, action, nullTime, action, nullTime, claimId],

    function(err, rows, fields) {
      if (err) {
        appData.error = 1;
        appData["data"] = "Error Occured!";
        console.log(err);
        res.status(400).json(appData);
      } else {
        appData.error = 0;
        console.log(appData);
        res.status(201).json(appData);
      }
    }
  );
});

// date viewed (Read) stamp
router.post("/Analytics/:claimId/:node/", (req, res, next) => {
  let appData = {};
  const claimId = res.locals.claimId;
  const nodeNum = res.locals.node;
  const viewed_date = new Date();
  appData = {
    viewed_at: viewed_date
  };
  database.query(
    "INSERT INTO analytics where claimId = ? , nodeNum = ?",
    [claimId, nodeNum],
    function(err, rows, fields) {
      if (err) {
        appData.error = 1;
        appData["data"] = "Error Occured!";
        res.status(400).json(appData);
      } else {
        appData.error = 0;
        res.status(201).json(appData);
      }
    }
  );
});

//  updated stamp
router.post("/Analytics/:claimId/:node/", (req, res, next) => {
  let appData = {};
  const claimId = res.locals.claimId;
  const nodeNum = res.locals.node;
  const updated = new Date();
  appData = {
    updated_at: updated
  };
  database.query(
    "INSERT INTO analytics where claimId = ? , nodeNum = ?",
    [claimId, nodeNum],
    function(err, rows, fields) {
      if (err) {
        appData.error = 1;
        appData["data"] = "Error Occured!";
        res.status(400).json(appData);
      } else {
        appData.error = 0;
        res.status(201).json(appData);
      }
    }
  );
});

module.exports = router;
