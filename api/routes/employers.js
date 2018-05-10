const express = require("express");
const router = express.Router();
const database = require("../db.js");

router.get("/claims/:companyId", (req, res, next) => {
  let appData = {};
  const id = req.params.companyId;
  database.query(
    "SELECT User.name, User.id, Claim.* FROM User, Claim WHERE User.id = Claim.userId AND Claim.companyId = ?",
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
});

router.get("/actionClaims/:companyId", (req, res, next) => {
  let appData = {};
  const id = req.params.companyId;
  database.query(
    "SELECT User.name, User.id as userId, WorkHistory.* FROM User, WorkHistory WHERE User.id = WorkHistory.userId AND WorkHistory.companyId = ? AND WorkHistory.employerConfirmed = 0",
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
});

router.patch("/updateWorkHistory", (req, res, next) => {
  let appData = {};
  const data = {
    id: req.body.workHistoryId,
    confirmJob: req.body.confirmJob,
    confirmTasks: req.body.confirmTasks,
    comments: req.body.comments || null
  };
  database.query(
    "UPDATE WorkHistory SET employerConfirmed = ?, confirmJob = ?, confirmTasks = ?, comments = ? WHERE id = ?",
    [1, data.confirmJob, data.confirmTasks, data.comments, data.id],
    function(err, rows, fields) {
      if (err) {
        appData.error = 1;
        appData["data"] = "Error Occured!";
        res.status(400).json(appData);
      } else {
        appData.error = 0;
        appData["data"] = "Successfully updated Work History for employer!";
        res.status(201).json(appData);
      }
    }
  );
});

module.exports = router;
