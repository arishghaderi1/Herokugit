const express = require("express");
const router = express.Router();
const database = require("../db.js");

router.get("/claims/:wsibId/:order", (req, res, next) => {
  let appData = {};
  const id = req.params.wsibId;
  const order = req.params.order;
  let sortBy = "";
  let stats = "progress";
  
  if(order === "recent"){
    sortBy = "ORDER BY updated_At DESC" //"updated_At"     // Sort the clients by most recent claims, last updated, Static (inActive), etc
    stats = ""}
  
    else if (order === "Inactive"){
    sortBy = ""
    stats = " AND Claim.status = 'Inactive'"  }
  
  
  
  // Query the database based on Sort parameter
  database.query(
    "SELECT User.name, User.id, Claim.* FROM User, Claim WHERE  User.id = Claim.userId" + stats + " AND Claim.adjudicatorId = ?" + sortBy,
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

module.exports = router;
