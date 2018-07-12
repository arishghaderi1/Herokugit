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
  const id = req.body.workHistoryId;
  const claimId = req.body.claimId;
  const data = {
    employerConfirmed: 1,
    employeeId: req.body.employeeId,
    confirmJob: req.body.confirmJob,
    confirmTasks: req.body.confirmTasks,
    comments: req.body.comments || null
  };
  database.query("UPDATE WorkHistory SET ? WHERE id = ?", [data, id], function(
    err,
    rows,
    fields
  ) {
    if (err) {
      appData.error = 1;
      appData["data"] = "Error Occured!";
      res.status(400).json(appData);
    } else {
      appData.error = 0;
      appData["data"] = "Successfully updated Work History for employer!";
      res.locals.employeeId = data.employeeId;
      res.locals.claimId = claimId;
      next();
    }
  });
});

/**
 * Check if all workHistory has been confirmed for user
 */
router.patch("/updateWorkHistory", (req, res, next) => {
  let appData = {};
  const id = res.locals.employeeId;
  database.query(
    "SELECT id FROM WorkHistory WHERE employeeId = ? AND employerConfirmed = ?",
    [id, 0],
    function(err, rows, fields) {
      if (err) {
        appData.error = 1;
        appData["data"] = "Error Occured!";
        res.status(400).json(appData);
      } else {
        if (rows.length < 1) {
          next();
        } else {
          appData.error = 0;
          appData["data"] = "Successfully updated Work History for employer!";
          res.status(201).json(appData);
        }
      }
    }
  );
});

/**
 * Update employer section of claim to say completed.
 */
router.patch("/updateWorkHistory", (req, res, next) => {
  let appData = {};
  const actionRequired = "{}";
  database.query(
    "UPDATE Claim SET employer = ?, actionRequired = ?",
    [1, actionRequired],
    function(err, rows, fields) {
      if (err) {
        appData.error = 1;
        appData["data"] = "Error Occured!";
        res.status(400).json(appData);
      } else {
        next();
      }
    }
  );
});

/**
 * Check if every form is completed
 */
router.patch("/updateWorkHistory", (req, res, next) => {
  let appData = {};
  const claimId = res.locals.claimId;
  database.query(
    "SELECT id FROM Claim WHERE id = ? AND employee = ? AND employer = ? AND doctor = ?",
    [claimId, 1, 1, 1],
    function(err, rows, fields) {
      if (err) {
        appData.error = 1;
        appData["data"] = "Error Occured!";
        res.status(400).json(appData);
      } else {
        if (rows.length < 1) {
          appData.error = 0;
          appData["data"] = "Not all parties are done!";
          res.status(201).json(appData);
        } else {
          next();
        }
      }
    }
  );
});

/**
 * Update Node Array
 */
router.patch("/updateWorkHistory", (req, res, next) => {
  let appData = {};
  const claimId = res.locals.claimId;
  const date = new Date();
  const nodeArray = [
    {
      name: "Information Gathering",
      details:
        "Information from all parties is currently being gathered, just as you have to fill out your required info, so must your employer and audiologist.",
      state: 1,
      nextSteps:
        "Once all information from all parties has been received the claim will be reveiwed by an adjudicator who will make a decision.",
      startDate: "00-00-00 00:00:00",
      endDate: date
    },
    {
      name: "Under Review",
      details:
        "All information required to make a decision on your claim has been recieved.",
      state: null,
      nextSteps:
        "You will receive a notification when the adjudicator has made a decision on your claim, this can take up to 3 days.",
      startDate: date,
      endDate: "00-00-00 00:00:00"
    }
  ];

  database.query(
    "UPDATE NodeArray SET Step2 = ?, Step3 = ? WHERE claimId = ?",
    [JSON.stringify(nodeArray[0]), JSON.stringify(nodeArray[1]), claimId],
    function(err, rows, fields) {
      if (err) {
        appData.error = 1;
        appData["data"] = "Error Occured!";
        res.status(400).json(appData);
      } else {
        appData.error = 0;
        appData["data"] = "Successfully updated NodeArray !";
        res.status(201).json(appData);
      }
    }
  );
});

module.exports = router;
