const express = require("express");
const router = express.Router();
const database = require("../db.js");

router.get("/claims/:employerId", (req, res, next) => {
  let appData = {};
  const id = req.params.employerId;
  database.query(
    "SELECT Claim.*, User.firstName, User.lastName FROM Claim INNER JOIN User ON Claim.employeeId = User.id WHERE Claim.companyId = (SELECT id FROM Company WHERE Company.contactId = ?)",
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

router.get("/actionClaims/:employerId", (req, res, next) => {
  let appData = {};
  const id = req.params.employerId;
  database.query(
    "SELECT User.firstName, User.lastName, WorkHistory.* FROM WorkHistory INNER JOIN User ON User.id = WorkHistory.employeeId WHERE WorkHistory.companyId = (SELECT id FROM Company WHERE Company.contactId = ?) AND WorkHistory.employerConfirmed = 0",
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
