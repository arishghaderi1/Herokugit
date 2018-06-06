const express = require("express");
const router = express.Router();
const database = require("../db.js");

router.get("/:userId", (req, res, next) => {
  let appData = {};
  const id = req.params.currentUserId;
  database.connection.getConnection(function(err, connection) {
    if (err) {
      appData["error"] = 1;
      appData["data"] = "Internal Server Error";
      res.status(500).json(appData);
    } else {
      connection.query(
        "SELECT * FROM Notification WHERE userId = ? ORDER BY createdAt DESC",
        [id],
        function(err, rows, fields) {
          if (err) {
            appData.error = 1;
            appData["data"] = "Error Occured!";
            console.log(err);
            res.status(400).json(appData);
          } else {
            res.status(200).json(rows);
          }
        }
      );
      connection.release();
    }
  });
});
module.exports = router;
