const express = require("express");
const router = express.Router();
const database = require("../db.js");

router.get("/:userId", function(req, res) {
  let appData = {};
  const id = req.params.userId;
  database.query(
    "SELECT * FROM Notification WHERE userId = ? ORDER BY createdAt DESC",
    id,
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
});

router.get("/update/:notifId", function(req, res) {
  let appData = {};
  const id = req.params.notifId;
  database.query(
    "UPDATE Notification SET isRead = 1 WHERE id = ?",
    [id],
    function(err, rows, fields) {
      if (!err) {
        appData.error = 0;
        appData["data"] = "Notification Updated Correctly!";
        res.status(201).json(appData);
      } else {
        appData["data"] = "Error Occured!";
        appData["error"] = err;
        res.status(400).json(appData);
      }
    }
  );
});

module.exports = router;
