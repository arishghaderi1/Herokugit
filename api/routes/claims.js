const express = require("express");
const router = express.Router();
const database = require("../db");

// Get All Claims
router.post("/", (req, res, next) => {
  let appData = {};
  let notWithStatus =
    req.body.excludeStatus.length !== 0 ? req.body.excludeStatus : "";
  let notWithIds = req.body.excludeIds.length !== 0 ? req.body.excludeIds : "";

  database.query(
    "SELECT * FROM Claim WHERE id NOT IN (?) AND status NOT IN (?) ORDER by createdAt DESC LIMIT 15",
    [notWithIds, notWithStatus],
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
});
//Create a claim
router.post("/create", (req, res, next) => {
  let appData = {};
  const today = new Date();
  const data = {
    userId: req.body.userId,
    adjudicatorId: req.body.adjudicatorId || null,
    doctorId: req.body.doctorId || null,
    status: req.body.status,
    injuryType: req.body.injuryType,
    notes: req.body.notes || null,
    created_at: today,
    updated_at: today
  };
  database.query("INSERT INTO Claim SET ?", data, function(err, rows, fields) {
    if (err) {
      console.log(err);
      appData.error = 1;
      appData["data"] = "Error Occured!";
      res.status(400).json(appData);
    } else {
      res.status(200).json(rows);
    }
  });
});

//Edit/Update NodeArray
//Create a claim
router.patch("/nodeArray", (req, res, next) => {
  let appData = {};
  const today = new Date();
  const nodeId = req.body.nodeId;
  const data = {
    userId: req.body.userId,
    nodeName: req.body.nodeName,
    nodeDetails: req.body.nodeDetails,
    nodeState: req.body.nodeState,
    nextSteps: req.body.nextSteps,
    notes: req.body.notes,
    eta: req.body.eta,
    dateCompleted: null,
    updated_at: date
  };
  database.query("UPDATE NodeArray SET ? WHERE id=?", [data, nodeId], function(
    err,
    rows,
    fields
  ) {
    if (err) {
      console.log(err);
      appData.error = 1;
      appData["data"] = "Error Occured!";
      res.status(400).json(appData);
    } else {
      appData.error = 0;
      appData["data"] = "Updated NodeArray!";
      res.status(201).json(appData);
    }
  });
});

// Get Claim with certain ID
router.get("/:claimId", (req, res, next) => {
  let appData = {};
  const id = req.params.claimId;
  database.query("SELECT * FROM Claim WHERE id = ?", id, function(
    err,
    rows,
    fields
  ) {
    if (err) {
      appData.error = 1;
      appData["data"] = "Error Occured!";
      res.status(400).json(appData);
    } else {
      res.status(200).json(rows);
    }
  });
});

module.exports = router;
