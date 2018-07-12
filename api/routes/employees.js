const express = require("express");
const router = express.Router();
const database = require("../db.js");

router.get("/nodeArray/:userId", (req, res, next) => {
  let appData = {};
  const id = req.params.userId;
  database.query(
    "SELECT * FROM NodeArray WHERE employeeId = ? ORDER BY id",
    [id],
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

router.get("/getForms/:userId", function(req, res) {
  let appData = {};
  const id = req.params.userId;
  database.query("SELECT * FROM Form WHERE userId = ?", [id], function(
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
      appData["error"] = 0;
      appData["data"] = rows;
      res.status(200).json(appData);
    }
  });
});

/* 
***************************
START OF CREATE CLAIM CALLS 
***************************
*/

/*
  Create a claim and return insertId
*/
router.post("/createClaim", (req, res, next) => {
  let appData = {};
  let claimData = {
    employeeId: req.body.employeeId,
    doctorId: req.body.doctorId,
    companyId: req.body.companyId,
    adjudicatorId: 3,
    actionRequired: req.body.actionRequired,
    createdAt: new Date(),
    injuryType: req.body.injuryType,
    status: "Active",
    notes: req.body.notes || ""
  };
  database.query("INSERT INTO Claim SET ? ", claimData, function(
    err,
    rows,
    fields
  ) {
    if (err) {
      console.log("Creating Claim Error: ");
      console.log(err);
      appData.error = 1;
      appData["data"] = "Error Occured!";
      res.status(400).json(appData);
    } else {
      res.locals.claimId = rows.insertId;
      res.locals.employeeId = claimData.employeeId;
      res.locals.companyId = claimData.companyId;
      res.locals.doctorId = claimData.doctorId;
      res.locals.adjudicatorId = claimData.adjudicatorId;
      next();
    }
  });
});

/*
  Create Form and return insertId
*/
router.post("/createClaim", (req, res, next) => {
  let appData = {};
  const formData = {
    name: req.body.name,
    code: req.body.code,
    userId: res.locals.employeeId,
    personal: req.body.personal,
    formSpecific: req.body.formSpecific,
    workHistory: req.body.workHistory,
    consent: req.body.consent,
    status: 1
  };
  database.query("INSERT INTO Form SET ?", formData, function(
    err,
    rows,
    fields
  ) {
    if (err) {
      console.log("Creating Form Error: ");
      console.log(err);
      appData.error = 1;
      appData["data"] = "Error Occured!";
      res.status(400).json(appData);
    } else {
      res.locals.formId = rows.insertId;
      next();
    }
  });
});

/*
  Reference Form in Document
*/
router.post("/createClaim", (req, res, next) => {
  let appData = {};
  const claimId = res.locals.claimId;
  const formId = res.locals.formId;
  const name = req.body.name;
  const userId = res.locals.employeeId;
  const type = req.body.type;
  const date = new Date();
  if (type === "form") {
    database.query(
      "INSERT INTO Document (claimId, userId, name, type, data, createdAt) VALUES(?, ?, ?, ?, ?, ?)",
      [claimId, userId, name, type, formId, date],
      function(err, rows, fields) {
        if (err) {
          console.log("Creating Document Error: ");
          console.log(err);
          appData.error = 1;
          appData["data"] = "Error Occured!";
          res.status(400).json(appData);
        } else {
          res.locals.documentId = rows.insertId;
          next();
        }
      }
    );
  } else {
    next();
  }
});

/*
  Update Claim with Documents and Completed Employee
*/
router.post("/createClaim", (req, res, next) => {
  let appData = {};
  const documentId = res.locals.documentId;
  const claimId = res.locals.claimId;
  database.query(
    "UPDATE Claim SET documents = ?, employee = ? WHERE id = ?",
    [documentId, 1, claimId],
    function(err, rows, fields) {
      if (err) {
        console.log("Creating Document Error: ");
        console.log(err);
        appData.error = 1;
        appData["data"] = "Error Occured!";
        res.status(400).json(appData);
      } else {
        res.locals.documentId = rows.insertId;
        next();
      }
    }
  );
});

/*
  Get primaryContactId
*/
router.post("/createClaim", (req, res, next) => {
  let appData = {};
  const companyId = res.locals.companyId;
  database.query(
    "SELECT contactId FROM Company WHERE id = ?",
    companyId,
    function(err, rows, fields) {
      if (err) {
        console.log("Getting contactId Error: ");
        console.log(err);
        appData.error = 1;
        appData["data"] = "Error Occured!";
        res.status(400).json(appData);
      } else {
        res.locals.contactId = rows[0].contactId;
        next();
      }
    }
  );
});

/*
  Send notifications to everybody
*/
router.post("/createClaim", (req, res, next) => {
  let appData = {};
  const data = [
    {
      userId: res.locals.contactId,
      action: "Confirm Employment",
      body: "Please confirm this workers employment.",
      isRead: 0,
      createdAt: new Date(),
      goTo: JSON.stringify({ tab: "DashboardTab", details: {} })
    },
    {
      userId: res.locals.doctorId,
      action: "Upload Patient Audiogram",
      body: "Please upload any and all audiograms for this patient.",
      isRead: 0,
      createdAt: new Date(),
      goTo: JSON.stringify({
        tab: "DashboardTab",
        details: { activeClaim: res.locals.claimId }
      })
    },
    {
      userId: res.locals.adjudicatorId,
      action: "New Claim",
      body:
        "You've been assigned a new claim. Watch for updates for required forms being filled out.",
      isRead: 0,
      createdAt: new Date(),
      goTo: JSON.stringify({
        tab: "DashboardTab",
        details: { activeClaim: res.locals.claimId }
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
  next();
});

/**
 * Create NodeArray for user
 */
router.post("/createClaim", (req, res, next) => {
  let appData = {};
  const employeeId = res.locals.employeeId;
  const claimId = res.locals.claimId;
  const date = new Date();
  const nodeArray = [
    {
      name: "Claim Started",
      details: "Your claim has been started.",
      state: 1,
      nextSteps:
        "Please see your forms section and ensure you have filled out all of the required information, other parties will also need to fill out their required forms.",
      startDate: date,
      endDate: "00-00-00 00:00:00"
    },
    {
      name: "Information Gathering",
      details:
        "Information from all parties is currently being gathered, just as you have to fill out your required info, so must your employer and audiologist.",
      state: null,
      nextSteps:
        "Once all information from all parties has been received the claim will be reveiwed by an adjudicator who will make a decision.",
      startDate: "00-00-00 00:00:00",
      endDate: "00-00-00 00:00:00"
    },
    {
      name: "Under Review",
      details:
        "All information required to make a decision on your claim has been recieved.",
      state: 0,
      nextSteps:
        "You will receive a notification when the adjudicator has made a decision on your claim, this can take up to 3 days.",
      startDate: "00-00-00 00:00:00",
      endDate: "00-00-00 00:00:00"
    },
    {
      name: "Decision",
      details: "A decision on your claim will be made.",
      state: 0,
      nextSteps:
        "You should now be able to view your benefits in the documents section of your portal. Please review the decision.",
      startDate: "00-00-00 00:00:00",
      endDate: "00-00-00 00:00:00"
    }
  ];

  database.query(
    "INSERT INTO NodeArray (employeeId, claimId, Step1, Step2, Step3, Step4) VALUES(?,?,?,?,?,?)",
    [
      employeeId,
      claimId,
      JSON.stringify(nodeArray[0]),
      JSON.stringify(nodeArray[1]),
      JSON.stringify(nodeArray[2]),
      JSON.stringify(nodeArray[3])
    ],
    function(err, rows, fields) {
      if (err) {
        appData.error = 1;
        appData["data"] = "Error Occured!";
        res.status(400).json(appData);
      } else {
        appData.error = 0;
        appData["data"] = "Successfully created NodeArray and everything else!";
        res.status(200).json(appData);
      }
    }
  );
});

module.exports = router;
