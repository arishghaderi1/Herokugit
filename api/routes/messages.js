const express = require("express");
const router = express.Router();
const database = require("../db.js");

router.post("/", (req, res, next) => {
  const today = new Date();
  let appData = {};
  const message = {
    fromId: req.body.fromId,
    toId: req.body.toId,
    message: req.body.message,
    createdAt: today
  };
  database.query("INSERT INTO Message SET ?", message, function(
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
      appData["data"] = "Successfully sent message!";
      res.status(201).json(appData);
    }
  });
});

router.patch("/", (req, res, next) => {
  const today = new Date();
  let appData = {};
  const message = {
    fromId: req.body.fromId,
    toId: req.body.toId
  };
  database.query(
    "UPDATE Message SET unRead = ? WHERE (fromId = ? AND toId = ?) OR (fromId = ? AND toId = ?)",
    [1, message.fromId, message.toId, message.toId, message.fromId],
    function(err, rows, fields) {
      if (err) {
        appData.error = 1;
        appData["data"] = "Error Occured!";
        console.log(err);
        res.status(400).json(appData);
      } else {
        appData.error = 0;
        appData["data"] = "Successfully marked messages read!";
        res.status(201).json(appData);
      }
    }
  );
});

router.get("/countUnread/:fromId", (req, res, next) => {
  let appData = {};
  const message = {
    fromId: req.params.fromId
  };
  database.query(
    "SELECT fromId, toId, COUNT(DISTINCT fromID) as unRead FROM Message WHERE toId = ? AND unRead = ?",
    [message.fromId, 0],
    function(err, rows, fields) {
      if (err) {
        appData.error = 1;
        appData["data"] = "Error Occured!";
        console.log(err);
        res.status(400).json(appData);
      } else {
        res.status(200).json(rows[0]);
      }
    }
  );
});

router.get("/countUnreadMessages/:fromId/:toId", (req, res, next) => {
  let appData = {};
  const message = {
    fromId: req.params.fromId,
    toId: req.params.toId
  };
  database.query(
    "SELECT fromId, toId, COUNT(*) as unRead FROM Message WHERE toId = ? AND fromId = ? AND unRead = ?",
    [message.fromId, message.toId, 0],
    function(err, rows, fields) {
      if (err) {
        appData.error = 1;
        appData["data"] = "Error Occured!";
        console.log(err);
        res.status(400).json(appData);
      } else {
        res.status(200).json(rows[0]);
      }
    }
  );
});

router.get("/contacts/:view/:fromId", (req, res, next) => {
  let appData = {};
  const message = {
    view: req.params.view,
    fromId: req.params.fromId
  };
  if (message.view === "employee") {
    database.query(
      "SELECT User.name, User.id, User.view FROM User WHERE id = (SELECT adjudicatorId FROM Claim WHERE userId = ?) OR id = (SELECT doctorId FROM Claim WHERE userId = ?)",
      [message.fromId, message.fromId],
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
  } else if (message.view === "employer") {
    database.query(
      "SELECT User.name, User.id, User.view FROM User WHERE id = (SELECT adjudicatorId FROM Claim WHERE id = ?)",
      [message.fromId],
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
  } else if (message.view === "wsib") {
    database.query(
      "SELECT User.name, User.id, User.view FROM User WHERE id = (SELECT userId FROM Claim WHERE id = ?) OR id = (SELECT doctorId FROM Claim WHERE id = ?)",
      [message.fromId, message.fromId],
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
  } else if (message.view === "doctor") {
    database.query(
      "SELECT User.name, User.id, User.view FROM User WHERE id = (SELECT adjudicatorId FROM Claim WHERE id = ?) OR id = (SELECT userId FROM Claim WHERE id = ?)",
      [message.fromId, message.fromId],
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
  }
});

router.get("/:fromId/:toId", (req, res, next) => {
  const today = new Date();
  let appData = {};
  const message = {
    fromId: req.params.fromId,
    toId: req.params.toId
  };
  database.query(
    "SELECT * FROM Message WHERE (fromId = ? AND toId = ?) OR (fromId = ? AND toID = ?)",
    [message.fromId, message.toId, message.toId, message.fromId],
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

module.exports = router;
