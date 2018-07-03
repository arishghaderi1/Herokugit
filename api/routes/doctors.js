const express = require("express");
const router = express.Router();
const database = require("../db.js");

router.get("/claims/:currentUserId", (req, res, next) => {
  let appData = {};
  const id = req.params.currentUserId;

  database.query(
    "SELECT User.name as name, User.email as email, User.phone as phone, User.id as userId, Claim.*, ServiceHistory.recentServiceDate, ServiceHistory.servicesProvided FROM Claim LEFT JOIN User ON User.id = Claim.userId LEFT JOIN(SELECT MAX(date) recentServiceDate, servicesProvided, id, userId FROM ServiceHistory GROUP BY id LIMIT 1) ServiceHistory ON Claim.userId = ServiceHistory.userId WHERE Claim.doctorId = ?",
    [id],
    function(err, rows, fields) {
      if (err) {
        appData.error = 1;
        appData["data"] = "Error Occured!";
        res.status(400).json(appData);
      } else {
        res.status(200).json(rows);
      }
    }
  );
});

router.post("/claims/:currentUserId", (req, res, next) => {
  let appData = {};
  const id = req.params.currentUserId;
  const list = req.body.currentList.length > 0 ? req.body.currentList : 0;
  database.query(
    "SELECT User.name as name, User.email as email, User.phone as phone, User.id as userId, Claim.*, ServiceHistory.recentServiceDate, ServiceHistory.servicesProvided FROM Claim LEFT JOIN User ON User.id = Claim.userId LEFT JOIN(SELECT MAX(date) recentServiceDate, servicesProvided, id, userId FROM ServiceHistory GROUP BY id LIMIT 1) ServiceHistory ON Claim.userId = ServiceHistory.userId WHERE Claim.doctorId = ? AND Claim.id NOT IN (?) LIMIT 20",
    [id, list],
    function(err, rows, fields) {
      if (err) {
        console.log(err);
        appData.error = 1;
        appData["data"] = "Error Occured!";
        res.status(400).json(appData);
      } else {
        res.status(200).json(rows);
      }
    }
  );
});

router.get("/patientInfo/:claimId", (req, res, next) => {
  let appData = {};
  const id = req.params.claimId;
  database.query(
    "SELECT User.email, User.phone, User.birthdate, User.gender, Claim.id as claimId, Claim.injuryType User FROM User, Claim WHERE Claim.userId = User.id AND Claim.id = ?",
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

router.get("/audiograms/:claimId", (req, res, next) => {
  let appData = {};
  const id = req.params.claimId;
  database.query("SELECT * FROM Audiogram WHERE claimId = ?", [id], function(
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

router.get("/serviceHistory/:userId", (req, res, next) => {
  let appData = {};
  const id = req.params.userId;
  database.query(
    "SELECT * FROM ServiceHistory WHERE userId = ?",
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

router.get("/grid", (req, res, next) => {
  let appData = {};
  database.query("SELECT * FROM ServiceGrid", function(err, rows, fields) {
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

router.post("/updateAudiogram", (req, res, next) => {
  let appData = {};
  let data = {
    doctorId: req.body.doctorId,
    userId: req.body.userId,
    claimId: req.body.claimId,
    audioId: req.body.audiogramId || false,
    audiogram: req.body.data,
    comments: req.body.comments
  };
  const today = new Date();
  if (data.audioId !== false) {
    database.query(
      "UPDATE Audiogram SET data = ?, comments = ?, updatedAt = ? WHERE id = ?",
      [data.audiogram, data.comments, today, data.audioId],
      function(err, rows, fields) {
        if (err) {
          console.log("Error in udpate sql");
          console.log(err);
        } else {
          appData["error"] = 0;
          appData["data"] = "Updated audiogram";
          res.status(201).json(appData);
        }
      }
    );
  } else {
    database.query(
      "INSERT INTO Audiogram (claimId,userId,doctorId,data,comments,createdAt) VALUES (?,?,?,?,?,?)",
      [
        data.claimId,
        data.userId,
        data.doctorId,
        data.audiogram,
        data.comments,
        today
      ],
      function(err, rows, fields) {
        if (err) {
          console.log("Error in insert sql");
          console.log(err);
        } else {
          appData["error"] = 0;
          appData["data"] = "New Audiogram created.";
          res.status(201).json(appData);
        }
      }
    );
  }
});

router.get("/findPatient/:searchValue", (req, res, next) => {
  let appData = {};
  const searchValue = req.params.searchValue;
  database.query(
    "SELECT User.id, claimId FROM User INNER JOIN (SELECT id as claimId, userId FROM Claim) Claim ON User.id = Claim.userId WHERE healthCardNum = ? OR claimId = ? LIMIT 1",
    [searchValue, searchValue],
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

router.post("/createClaim", (req, res, next) => {
  let appData = {};
  let claimData = {
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
  database.query(
    "SELECT id FROM User WHERE email = ? LIMIT 1",
    claimData.email,
    function(err, rows, fields) {
      if (err) {
        console.log("Error in sql");
      } else {
        if (rows.length > 0) {
          claimData.userId = rows[0].id;
          res.locals.claimData = claimData;
          next();
        } else {
          res.locals.claimData = claimData;
          next();
        }
      }
    }
  );
});

router.post("/createClaim", (req, res, next) => {
  let appData = {};
  if (res.locals.claimData.userId === null) {
    const data = res.locals.cliamData;
    database.query(
      "INSERT INTO User (name, email, phone) VALUES(?, ?, ?)",
      [claimData.name, claimData.email, claimData.phone],
      function(err, rows, fields) {
        if (err) {
          appData.error = 1;
          appData["data"] = "Error Occured!";
        } else {
          res.locals.claimData.userId = rows.insertId;
        }
      }
    );
  }
  next();
});

router.post("/createClaim", (req, res, next) => {
  let appData = {};
  const claimData = res.locals.claimData;
  const date = new Date();
  database.query(
    "INSERT INTO Claim (userId, doctorId, companyId, created_at, status, injuryType, notes) VALUES(?,?,?,?,'started',?,?)",
    [
      claimData.userId,
      claimData.doctorId,
      claimData.companyId,
      date,
      claimData.injuryType,
      claimData.notes
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
});

router.post("/createClaim", (req, res, next) => {
  let appData = {};
  const claimData = res.locals.claimData;
  const action = "new claim";
  const body =
    "A new claim was created for you. Please fill out any additional details and work history.";
  database.query(
    "INSERT INTO Notification (userId, action, body) VALUES(?, ?, ?)",
    [claimData.userId, action, body],
    function(err, rows, fields) {
      if (err) {
        appData.error = 1;
        appData["data"] = "Error Occured!";
      } else {
        appData.error = 0;
        appData["data"] = "Successfully created Notification!";
      }
    }
  );
  next();
});

router.post("/createClaim", (req, res, next) => {
  let appData = {};
  const claimData = res.locals.claimData;
  const date = new Date();
  const nodeArray = [
    {
      userId: claimData.userId,
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
      userId: claimData.userId,
      nodeName: "Information Gathering",
      nodeDetails:
        "Information from all parties is currently being gathered, just as you have to fill out your required info, so must your employer and audiologist.",
      nodeState: null,
      nextSteps:
        "Once all information from all parties has been received the claim will be reveiwed by an adjudicator who will make a decision.",
      eta: 14
    },
    {
      userId: claimData.userId,
      nodeName: "Under Review",
      nodeDetails:
        "All information required to make a decision on your claim has been recieved.",
      nodeState: 0,
      nextSteps:
        "You will receive a notification when the adjudicator has made a decision on your claim, this can take up to 3 days.",
      eta: 3
    },
    {
      userId: claimData.userId,
      nodeName: "Decision",
      nodeDetails: "A decision on your claim will be made.",
      nodeState: 0,
      nextSteps:
        "Should have access to benefits information and information on which hearing aid to select.",
      eta: 1
    }
  ];

  nodeArray.map((node, index) => {
    database.query(
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
          appData.error = 0;
          appData["data"] = "Successfully created NodeArray!";
        }
      }
    );
  });
});

module.exports = router;
