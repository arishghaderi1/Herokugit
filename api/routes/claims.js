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
    "SELECT * FROM claims WHERE id NOT IN (?) AND status NOT IN (?) ORDER by created_at DESC LIMIT 15",
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

router.post("/create", (req, res, next) => {
  let appData = {};
  const data = {
    userId: req.body.userId
  };
  database.query(
    "INSERT INTO claims (user_id) VALUES(?)",
    [data.userId],
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

// Get Claim with certain ID
router.get("/:claimId", (req, res, next) => {
  let appData = {};
  const id = req.params.claimId;
  database.query("SELECT * FROM claims WHERE id = ?", id, function(
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
