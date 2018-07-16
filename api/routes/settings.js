const express = require("express");
const router = express.Router();
const database = require("../db.js");

router.get("/getsettings/:userId", (req, res, next) => {
  let appData = {};
  const id = req.params.userId;
  database.query("SELECT * FROM Settings WHERE userId = ?", [id], function(
    err,
    rows,
    fields
  ) {
    if (err) {
      appData.error = 1;
      appData["data"] = "Error Occured!";
      console.log(err);
      res.status(400).json(appData);
    } else {
      res.status(200).json(rows);
    }
  });
});

router.post("/update/:userId/:setting/:value", (req, res, next) => {
  let appData = {};
  const id = req.params.userId;
  const setting = req.params.setting;
  const value = req.params.value;
  database.query(
    "UPDATE Settings SET " + setting + " =? WHERE user_id = ?",
    [value, id],
    function(err, rows, fields) {
      if (err) {
        appData.error = 1;
        appData["data"] = "Error Occured!";
        console.log(err);
        res.status(400).json(appData);
      } else {
        appData.error = 0;
        appData["data"] = "Updated setting";
        res.status(201).json(appData);
      }
    }
  );
});

module.exports = router;
