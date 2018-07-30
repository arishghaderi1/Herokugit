const express = require("express");
const router = express.Router();
const database = require("../db.js");

/**
 * GET 3 CALLS FOR NOTIFICATION, CLAIM & NODE ARRAY
 */
router.get("/general/:userId", (req, res, next) => {
  let appData = {};
  const id = req.params.userId;
  database.query("SELECT * FROM Notification WHERE userId = ?", id, function(
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
      res.locals.userId = id;
      res.locals.notification = JSON.parse(JSON.stringify(rows));
      next();
    }
  });
});
router.get("/general/:userId", (req, res, next) => {
  let appData = {};
  let company = -1;
  const id = res.locals.userId;
  database.query("SELECT id FROM Company WHERE contactId = ?", id, function(
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
      res.locals.company = rows[0].id;
      next();
    }
  });
});
router.get("/general/:userId", (req, res, next) => {
  database.query(
    "SELECT * FROM Claim WHERE companyId = ?",
    res.locals.company,
    function(err, rows, fields) {
      if (err) {
        appData.error = 1;
        appData["data"] = "Error Occured!";
        console.log(err);
        res.status(400).json(appData);
      } else {
        if (rows.length > 0) {
          const data = {
            notification: res.locals.notification,
            claim: rows
          };
          res.status(200).json(data);
        } else {
          const data = {
            notification: res.locals.notification,
            claim: []
          };
          res.status(200).json(data);
        }
      }
    }
  );
});
// router.get("/general/:userId", (req, res, next) => {
//   let appData = {};
//   const id = res.locals.claim.id;
//   const claim = res.locals.claim;
//   database.query("SELECT * FROM NodeArray WHERE claimId = ?", id, function(
//     err,
//     rows,
//     fields
//   ) {
//     if (err) {
//       appData.error = 1;
//       appData["data"] = "Error Occured!";
//       console.log(err);
//       res.status(400).json(appData);
//     } else {
//       if (rows.length < 1) {
//         const data = {
//           notification: res.locals.notification,
//           claim: claim,
//           nodeArray: []
//         };
//         res.status(200).json(data);
//       } else {
//         const data = {
//           notification: res.locals.notification,
//           claim: claim,
//           nodeArray: JSON.parse(JSON.stringify(rows[0]))
//         };
//         res.status(200).json(data);
//       }
//     }
//   });
// });

router.get("/claims/:employerId", (req, res, next) => {
  let appData = {};
  const id = req.params.employerId;
  database.query(
    "SELECT Claim.*, User.firstName, User.lastName FROM Claim INNER JOIN User ON Claim.employeeId = User.id WHERE Claim.companyId = (SELECT id FROM Company WHERE Company.contactId = ?)",
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

router.get("/actionClaims/:employerId", (req, res, next) => {
  let appData = {};
  const id = req.params.employerId;
  database.query(
    "SELECT User.firstName, User.lastName, WorkHistory.*, Claim.employeeId, Claim.id as claimId FROM WorkHistory INNER JOIN User ON User.id = WorkHistory.employeeId INNER JOIN Claim ON Claim.employeeId = WorkHistory.employeeId  WHERE WorkHistory.companyId = (SELECT id FROM Company WHERE Company.contactId = ?) AND WorkHistory.employerConfirmed = 0 AND Claim.status != ?",
    [id, "inActive"],
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

router.patch("/updateWorkHistory", (req, res, next) => {
  let appData = {};
  const id = req.body.workHistoryId;
  const claimId = req.body.claimId;
  const employeeId = req.body.employeeId;
  const data = {
    employerConfirmed: 1,
    confirmJob: req.body.confirmJob,
    confirmTasks: req.body.confirmTasks,
    comments: req.body.comments || null
  };
  database.query("UPDATE WorkHistory SET ? WHERE id = ?", [data, id], function(
    err,
    rows,
    fields
  ) {
    if (err) {
      console.log(err);
      appData.error = 1;
      appData["data"] = "Error Occured!";
      res.status(400).json(appData);
    } else {
      res.locals.employeeId = employeeId;
      res.locals.claimId = claimId;
      next();
    }
  });
});

/**
 * Check if all workHistory has been confirmed for user
 */
router.patch("/updateWorkHistory", (req, res, next) => {
  let appData = {};
  const id = res.locals.employeeId;
  database.query(
    "SELECT id FROM WorkHistory WHERE employeeId = ? AND employerConfirmed = ?",
    [id, 0],
    function(err, rows, fields) {
      if (err) {
        console.loge(err);
        appData.error = 1;
        appData["data"] = "Error Occured!";
        res.status(400).json(appData);
      } else {
        if (rows.length < 1) {
          next();
        } else {
          appData.error = 0;
          appData["data"] = "Successfully updated Work History for employer!";
          res.status(201).json(appData);
        }
      }
    }
  );
});

/**
 * Get Claim actionRequired object
 */
router.patch("/updateWorkHistory", (req, res, next) => {
  let appData = {};
  const claimId = res.locals.claimId;
  database.query(
    "SELECT actionRequired FROM Claim WHERE id = ?",
    claimId,
    function(err, rows, fields) {
      if (err) {
        console.log(err);
        appData.error = 1;
        appData["data"] = err;
        res.status(400).json(appData);
      } else {
        res.locals.actionRequired = rows[0].actionRequired;
        next();
      }
    }
  );
});

/**
 * Update employer section of claim to say completed.
 */
router.patch("/updateWorkHistory", (req, res, next) => {
  let appData = {};
  let alteredActions = JSON.parse(res.locals.actionRequired);
  alteredActions.employer = { state: 0, message: "" };
  alteredActions = JSON.stringify(alteredActions);
  database.query(
    "UPDATE Claim SET employer = ?, actionRequired = ? WHERE id = ?",
    [1, alteredActions, res.locals.claimId],
    function(err, rows, fields) {
      if (err) {
        console.log(err);
        appData.error = 1;
        appData["data"] = "Error Occured!";
        res.status(400).json(appData);
      } else {
        next();
      }
    }
  );
});

/**
 * Check if every form is completed
 */
router.patch("/updateWorkHistory", (req, res, next) => {
  let appData = {};
  const claimId = res.locals.claimId;
  database.query(
    "SELECT id, adjudicatorId, employeeId FROM Claim WHERE id = ? AND employee = ? AND employer = ? AND doctor = ?",
    [claimId, 1, 1, 1],
    function(err, rows, fields) {
      if (err) {
        console.log(err);
        appData.error = 1;
        appData["data"] = "Error Occured!";
        res.status(400).json(appData);
      } else {
        if (rows.length < 1) {
          appData.error = 0;
          appData["data"] = "Not all parties are done!";
          res.status(201).json(appData);
        } else {
          res.locals.adjudicatorId = rows[0].adjudicatorId;
          res.locals.employeeId = rows[0].employeeId;
          next();
        }
      }
    }
  );
});

/**
 * Update Node Array
 */
router.patch("/updateWorkHistory", (req, res, next) => {
  let appData = {};
  const claimId = res.locals.claimId;
  database.query(
    "SELECT Step2 FROM NodeArray WHERE claimId = ?",
    claimId,
    function(err, rows, fields) {
      if (err) {
        console.log(err);
        appData.error = 1;
        appData["data"] = "Error Occured!";
        res.status(400).json(appData);
      } else {
        res.locals.startDate = JSON.parse(rows[0].Step2).startDate;
        next();
      }
    }
  );
});

/**
 * Update Node Array
 */
router.patch("/updateWorkHistory", (req, res, next) => {
  let appData = {};
  const claimId = res.locals.claimId;
  const startDate = res.locals.startDate;
  const date = new Date();
  const nodeArray = [
    {
      name: "Information Gathering",
      details:
        "Information from all parties is currently being gathered, just as you have to fill out your required info, so must your employer and audiologist.",
      state: 1,
      nextSteps:
        "Once all information from all parties has been received the claim will be reveiwed by an adjudicator who will make a decision.",
      startDate: startDate,
      endDate: date
    },
    {
      name: "Under Review",
      details:
        "All information required to make a decision on your claim has been recieved.",
      state: null,
      nextSteps:
        "You will receive a notification when the adjudicator has made a decision on your claim, this can take up to 3 days.",
      startDate: date,
      endDate: "00-00-00 00:00:00"
    }
  ];

  database.query(
    "UPDATE NodeArray SET Step2 = ?, Step3 = ? WHERE claimId = ?",
    [JSON.stringify(nodeArray[0]), JSON.stringify(nodeArray[1]), claimId],
    function(err, rows, fields) {
      if (err) {
        console.log(err);
        appData.error = 1;
        appData["data"] = "Error Occured!";
        res.status(400).json(appData);
      } else {
        appData.error = 0;
        appData["data"] = "Successfully updated NodeArray !";
        next();
      }
    }
  );
});

/**
 * Update actionRequired section of Claim for Adjudicator.
 */
router.patch("/updateWorkHistory", (req, res, next) => {
  let appData = {};
  let alteredActions = JSON.parse(res.locals.actionRequired);
  alteredActions.adjudicator = { state: 1, message: "Decision Time!" };
  res.locals.actionRequired = alteredActions;
  alteredActions = JSON.stringify(alteredActions);
  database.query(
    "UPDATE Claim SET actionRequired = ? WHERE id = ?",
    [1, alteredActions, res.locals.claimId],
    function(err, rows, fields) {
      if (err) {
        console.log(err);
        appData.error = 1;
        appData["data"] = "Error Occured!";
        res.status(400).json(appData);
      } else {
        next();
      }
    }
  );
});

/*
  Send notifications to everybody
*/
router.patch("/updateWorkHistory", (req, res, next) => {
  let appData = {};
  const data = [
    {
      userId: res.locals.adjudicatorId,
      action: "Completed Information Gathering",
      body:
        "Please confirm all neccesary documents are completed and make a decision.",
      isRead: 0,
      createdAt: new Date(),
      goTo: JSON.stringify({
        tab: "DashboardTab",
        details: { activeClaim: res.locals.claimId }
      })
    },
    {
      userId: res.locals.employeeId,
      action: "Completed Information Gathering",
      body:
        "We now have all the required information to make a decision. You will be notified once that is completed.",
      isRead: 0,
      createdAt: new Date(),
      goTo: JSON.stringify({
        tab: "DashboardTab",
        details: {}
      })
    }
  ];
  data.map(user => {
    database.query("INSERT INTO Notification SET ?", user, function(
      err,
      rows,
      fields
    ) {
      if (err) {
        console.log("Creating Notifications Error: ");
        console.log(err);
        appData.error = 1;
        appData["data"] = "Error Occured!";
        res.status(400).json(appData);
      }
    });
  });
  appData.error = 0;
  appData["data"] = "Successfully gathered all information!";
  res.status(201).json(appData);
});

module.exports = router;
