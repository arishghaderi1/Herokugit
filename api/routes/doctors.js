const express = require("express");
const router = express.Router();
const database = require("../db.js");

router.get("/claims/:currentUserId", (req, res, next) => {
  let appData = {};
  const id = req.params.currentUserId;
  database.connection.getConnection(function(err, connection) {
    if (err) {
      appData["error"] = 1;
      appData["data"] = "Internal Server Error";
      res.status(500).json(appData);
    } else {
      connection.query(
        "SELECT User.name as name, User.id as userId, Claim.* FROM User, Claim WHERE User.id = Claim.userId AND Claim.doctorId = ?",
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

router.get("/audiograms/:claimId", (req, res, next) => {
  let appData = {};
  const id = req.params.claimId;
  database.connection.getConnection(function(err, connection) {
    if (err) {
      appData["error"] = 1;
      appData["data"] = "Internal Server Error";
      res.status(500).json(appData);
    } else {
      connection.query(
        "SELECT * FROM Audiogram WHERE claimId = ?",
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

router.post("/updateAudiogram", (req, res, next) => {
  let appData = {};
  let data = {
    doctorId: req.body.currentUserId,
    claimId: req.body.claimId,
    audioId: req.body.audiogramId || false,
    audiogram: req.body.data,
    comments: req.body.comments
  };
  if (audioId) {
    database.connection.getConnection(function(err, connection) {
      if (err) {
        appData["error"] = 1;
        appData["data"] = "Internal Server Error";
        res.status(500).json(appData);
      } else {
        connection.query(
          "UPDATE Audiogram SET data = ?, comments = ? WHERE id = ?",
          [data.audiogram, data.comments, data.audioId],
          function(err, rows, fields) {
            if (err) {
              console.log("Error in sql");
            } else {
              appData["error"] = 0;
              appData["data"] = "Updated audiogram";
              res.status(201).json(appData);
            }
          }
        );
        connection.release();
      }
    });
  } else {
    database.connection.getConnection(function(err, connection) {
      if (err) {
        appData["error"] = 1;
        appData["data"] = "Internal Server Error";
        res.status(500).json(appData);
      } else {
        connection.query(
          "INSERT INTO Audiogram (claimId,doctorId,data,comments) VALUES (?,?,?,?)",
          [data.claimId, data.doctorId, data.audiogram, data.comments],
          function(err, rows, fields) {
            if (err) {
              console.log("Error in sql");
            } else {
              appData["error"] = 0;
              appData["data"] = "New Audiogram created.";
              res.status(201).json(appData);
            }
          }
        );
        connection.release();
      }
    });
  }
});

router.post("/createClaim", (req, res, next) => {
  let appData = {};
  let data = {
    doctorId: req.body.currentUserId,
    companyId: req.body.currentCompanyId || null,
    name: req.body.name,
    email: req.body.email,
    phone: req.body.phone || "",
    view: "employee",
    injuryType: req.body.injury,
    notes: req.body.notes || "",
    userId: null
  };
  database.connection.getConnection(function(err, connection) {
    if (err) {
      appData["error"] = 1;
      appData["data"] = "Internal Server Error";
      res.status(500).json(appData);
    } else {
      connection.query(
        "SELECT id FROM User WHERE email = ? LIMIT 1",
        data.email,
        function(err, rows, fields) {
          if (err) {
            console.log("Error in sql");
          } else {
            if (rows.length > 0) {
              data.userId = rows[0].id;
              res.locals.data = data;
              next();
            } else {
              res.locals.data = data;
              next();
            }
          }
        }
      );
      connection.release();
    }
  });
});

router.post("/createClaim", (req, res, next) => {
  let appData = {};
  if (res.locals.data.userId === null) {
    const data = res.locals.data;
    database.connection.getConnection(function(err, connection) {
      if (err) {
        appData["error"] = 1;
        appData["data"] = "Internal Server Error";
        res.status(500).json(appData);
      } else {
        connection.query(
          "INSERT INTO User (name, email, phone) VALUES(?, ?, ?)",
          [data.name, data.email, data.phone],
          function(err, rows, fields) {
            if (err) {
              appData.error = 1;
              appData["data"] = "Error Occured!";
            } else {
              res.locals.data.userId = rows.insertId;
            }
          }
        );
        connection.release();
      }
    });
  }
  next();
});

router.post("/createClaim", (req, res, next) => {
  let appData = {};
  const data = res.locals.data;
  const date = new Date();
  database.connection.getConnection(function(err, connection) {
    if (err) {
      appData["error"] = 1;
      appData["data"] = "Internal Server Error";
      res.status(500).json(appData);
    } else {
      connection.query(
        "INSERT INTO Claim (userId, doctorId, companyId, created_at, status, injuryType, notes) VALUES(?,?,?,?,'started',?,?)",
        [
          data.userId,
          data.doctorId,
          data.companyId,
          date,
          data.injuryType,
          data.notes
        ],
        function(err, rows, fields) {
          if (err) {
            appData.error = 1;
            appData["data"] = "Error Occured!";
            console.log(err);
            res.status(400).json(appData);
          } else {
            res.status(200).json(rows);
            next();
          }
        }
      );
      connection.release();
    }
  });
});

router.post("/createClaim", (req, res, next) => {
  let appData = {};
  const data = res.locals.data;
  const action = "new claim";
  const body =
    "A new claim was created for you. Please fill out any additional details and work history.";
  database.connection.getConnection(function(err, connection) {
    if (err) {
      appData["error"] = 1;
      appData["data"] = "Internal Server Error";
      res.status(500).json(appData);
    } else {
      connection.query(
        "INSERT INTO Notification (userId, action, body) VALUES(?, ?, ?)",
        [data.userId, action, body],
        function(err, rows, fields) {
          if (err) {
            appData.error = 1;
            appData["data"] = "Error Occured!";
          } else {
            res.locals.data.userId = rows.insertId;
          }
        }
      );
      connection.release();
    }
  });
  next();
});

router.post("/createClaim", (req, res, next) => {
  let appData = {};
  const data = res.locals.data;
  const date = new Date();
  const nodeArray = [
    {
      userId: data.userId,
      nodeName: "Claim Started",
      nodeDetails:
        "Your claim has been started by an Audiologist on " +
        date.toDateString() +
        ".",
      nodeState: 1,
      nextSteps:
        "Please see your forms section and ensure you have filled out all of the required information, it makes the process a lot faster.",
      eta: 1
    },
    {
      userId: data.userId,
      nodeName: "Information Gathering",
      nodeDetails:
        "Information from all parties is currently being gathered, just as you have to fill out your required info, so must your employer and audiologist.",
      nodeState: null,
      nextSteps:
        "Once all information from all parties has been received the claim will be reveiwed by an adjudicator who will make a decision.",
      eta: 14
    },
    {
      userId: data.userId,
      nodeName: "Under Review",
      nodeDetails:
        "All information required to make a decision on your claim has been recieved.",
      nodeState: 0,
      nextSteps:
        "You will receive a notification when the adjudicator has made a decision on your claim, this can take up to 3 days.",
      eta: 3
    },
    {
      userId: data.userId,
      nodeName: "Decision",
      nodeDetails: "A decision on your claim will be made.",
      nodeState: 0,
      nextSteps:
        "Should have access to benefits information and information on which hearing aid to select.",
      eta: 1
    }
  ];
  database.connection.getConnection(function(err, connection) {
    if (err) {
      appData["error"] = 1;
      appData["data"] = "Internal Server Error";
      res.status(500).json(appData);
    } else {
      nodeArray.map((node, index) => {
        connection.query(
          "INSERT INTO NodeArray (userId,nodeName,nodeDetails,nodeState,nextSteps,created_at) VALUES(?,?,?,?,?,?)",
          [
            node.userId,
            node.nodeName,
            node.nodeDetails,
            node.nodeState,
            node.nextSteps,
            date
          ],
          function(err, rows, fields) {
            if (err) {
              appData.error = 1;
              appData["data"] = "Error Occured!";
            } else {
              res.locals.data.user_id = rows.insertId;
            }
          }
        );
      });
      connection.release();
    }
  });
});

module.exports = router;
