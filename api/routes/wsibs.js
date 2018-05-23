const express = require("express");
const router = express.Router();
const database = require("../db.js");

router.get("/claims/:wsibId", (req, res, next) => {
  let appData = {};
  const id = req.params.wsibId;
  database.query(
    "SELECT User.name, User.id, Claim.* FROM User, Claim WHERE User.id = Claim.userId AND Claim.adjudicatorId = ?",
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

module.exports = router;
