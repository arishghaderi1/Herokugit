const express = require("express");
const router = express.Router();
const database = require("../db.js");

router.get("/:userId", function(req, res) {
  let appData = {};
  const id = req.params.userId;
  database.query(
      "SELECT * FROM Notification WHERE userId = ? ORDER BY createdAt DESC",
      [id],
      function(err, rows, fields) {
        if (err) {
          appData.error = 1;
          appData["data"] = "Error Occured!";
          console.log(err);
          res.status(400).json(appData);
        } else {
          appData["error"] = 0;
          appData["data"] = rows;
          res.status(200).json(appData);
        }
      }
    );
});

module.exports = router;
