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
  const newaddition = JSON.stringify({
    step: nodeNum,
    action: action,
    time: nullTime
  });
  const newaddition2 =
    JSON.stringify({
      step: nodeNum,
      action: action,
      time: nullTime
    }) + "~";
  database.query(
    "UPDATE Claim SET dates = IFNULL(CONCAT(dates, ? '~' ),?) WHERE id = ?",
    [newaddition, newaddition2, claimId],
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

// Read the Textfield containing all the DateStamps
router.get("/getdates/:userID", (req, res, next) => {
  let appData = {};
  const id = req.params.userID;
  database.query("SELECT Claim.dates FROM Claim WHERE id = ?", [id], function(
    err,
    rows,
    fields
  ) {
    if (err) {
      console.log(err);
      appData.error = 1;
      appData["data"] = err;
      res.status(400).json(appData);
    } else {
      res.status(200).json(rows); // return soemthing with 200, get but dont return anything with 201
    }
  });
});

module.exports = router;
