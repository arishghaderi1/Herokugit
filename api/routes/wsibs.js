const express = require("express");
const router = express.Router();
const database = require("../db.js");

router.get("/claims/:wsibId/:order", (req, res, next) => {
  let appData = {};
  const id = req.params.wsibId;
  const order = req.params.order;
  let sortBy = "";
  let stats = "progress";

  if (order === "recent") {
    sortBy = "ORDER BY updatedAt DESC"; //"updated_At"     // Sort the clients by most recent claims, last updated, Static (inActive), etc
    stats = "";
  } else if (order === "Inactive") {
    sortBy = "";
    stats = "WHERE Claim.status = 'Inactive'";
  } else if (order === "Active") {
    sortBy = "";
    stats = " WHERE Claim.status = 'Active'";
  } else if (order === "Pending") {
    sortBy = "";
    stats = " WHERE Claim.status = 'Pending Reply'";
  }

  // Query the database based on Sort parameter
  database.query(
    "SELECT User.name, Claim.* FROM User INNER JOIN Claim ON User.id = Claim.employeeId" +
      stats +
      " AND Claim.adjudicatorId = ?" +
      sortBy,
    id,
    function(err, rows, fields) {
      if (err) {
        console.log(err);
        appData.error = 1;
        appData["data"] = err;
        res.status(400).json(appData);
      } else {
        res.status(200).json(rows);
      }
    }
  );
});

router.get("/documents/:claimId/:userId", (req, res, next) => {
  let appData = {};
  const claimId = req.params.claimId;
  const userId = req.params.userId;
  database.query(
    "SELECT Document.*, Form.* FROM Document INNER JOIN Form ON Document.data = Form.id WHERE type='form' AND Document.claimId = ? AND Form.userId = ?",
    [claimId, userId],
    function(err, rows, fields) {
      if (err) {
        console.log(err);
        appData.error = 1;
        appData["data"] = err;
        res.status(400).json(appData);
      } else {
        res.status(200).json(rows);
      }
    }
  );
});

module.exports = router;
