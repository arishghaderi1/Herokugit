const express = require("express");
const router = express.Router();
const database = require("../db.js");

router.get("/nodeArray/:userId", (req, res, next) => {
  let appData = {};
  const id = req.params.userId;
  database.query(
    "SELECT * FROM NodeArray WHERE userId = ? ORDER BY id",
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
});

router.patch("/updateInfo", (req, res, next) => {
  let appData = {};
  const user = {
    id: req.body.userId,
    name: req.body.name,
    email: req.body.email,
    phone: req.body.phone
  };
  database.query(
    "UPDATE User SET name = ?, email = ?, phone = ? WHERE id = ?",
    [user.name, user.email, user.phone, user.id],
    function(err, rows, fields) {
      if (err) {
        appData.error = 1;
        appData["data"] = "Error Occured!";
        console.log(err);
        res.status(400).json(appData);
      } else {
        appData.error = 0;
        appData["data"] = "Successfully updated user information!";
        res.status(201).json(appData);
      }
    }
  );
});

router.post("/workHistory", (req, res, next) => {
  let appData = {};
  const history = {
    userId: req.body.userId,
    job: req.body.job,
    tasks: req.body.tasks,
    startDate: req.body.startDate,
    endDate: req.body.endDate,
    companyId: req.body.companyId
  };
  database.query("INSERT INTO WorkHistory SET ?", [history], function(
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
      appData.error = 0;
      appData["data"] = "Successfully created Work History entry!";
      res.status(200).json(appData);
    }
  });
});

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
