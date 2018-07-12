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
        res.locals.claims = rows;
        next();
      }
    }
  );
});

router.get("/claims/:wsibId/:order", (req, res, next) => {
  let appData = {};
  const claims = res.locals.claims;
  let merger = claims;
  claims.map((claim, index) => {
    database.query(
      "SELECT Document.*, Form.* FROM Document INNER JOIN Form ON Document.data = Form.id WHERE type='form' AND Document.claimId = ?",
      claim.id,
      function(err, rows, fields) {
        if (err) {
          console.log(err);
          appData.error = 1;
          appData["data"] = err;
          res.status(400).json(appData);
        } else {
          
          if(rows.length > 0) {
            console.log("FORMS RESULT: ");
          console.log(rows);
            merger[index].concat(rows);
          }
        }
      }
    );
  });
  res.status(200).json(merger);
  // Query the database based on Sort parameter
});

module.exports = router;
