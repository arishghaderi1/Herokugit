const express = require("express");
const router = express.Router();
const database = require("../db.js");

router.get("/claims/:wsibId/:order", (req, res, next) => {
  let appData = {};
  const id = req.params.wsibId;
  const order = req.params.order;
  let sortBy = "";
  let stats = "progress";

  if (order === "recent") {
    sortBy = "ORDER BY updatedAt DESC"; //"updated_At"     // Sort the clients by most recent claims, last updated, Static (inActive), etc
    stats = "";
  } else if (order === "Inactive") {
    sortBy = "";
    stats = "WHERE Claim.status = 'Inactive'";
  } else if (order === "Active") {
    sortBy = "";
    stats = " WHERE Claim.status = 'Active'";
  } else if (order === "Pending") {
    sortBy = "";
    stats = " WHERE Claim.status = 'Pending Reply'";
  }

  // Query the database based on Sort parameter
  database.query(
    "SELECT User.name, Claim.* FROM User INNER JOIN Claim ON User.id = Claim.employeeId" +
      stats +
      " AND Claim.adjudicatorId = ?" +
      sortBy,
    id,
    function(err, rows, fields) {
      if (err) {
        console.log(err);
        appData.error = 1;
        appData["data"] = err;
        res.status(400).json(appData);
      } else {
        res.status(200).json(rows);
      }
    }
  );
});

router.get("/documents/:claimId", (req, res, next) => {
  let appData = {};
  const claimId = req.params.claimId;
  database.query(
    "SELECT Document.type, Document.createdAt, Form.* FROM Document INNER JOIN Form ON Document.referenceId = Form.id WHERE Document.claimId = ? AND Document.type = ?",
    [claimId, "form"],
    function(err, rows, fields) {
      if (err) {
        console.log(err);
        appData.error = 1;
        appData["data"] = err;
        res.status(400).json(appData);
      } else {
        res.locals.forms = JSON.parse(JSON.stringify(rows));
        next();
      }
    }
  );
});

router.get("/documents/:claimId", (req, res, next) => {
  let appData = {};
  const claimId = req.params.claimId;
  database.query(
    "SELECT Document.type, Document.createdAt, Asset.* FROM Document INNER JOIN Asset ON Document.referenceId = Asset.id WHERE Document.claimId = ? AND Document.type = ?",
    [claimId, "image"],
    function(err, rows, fields) {
      if (err) {
        console.log(err);
        appData.error = 1;
        appData["data"] = err;
        res.status(400).json(appData);
      } else {
        let merged = [...res.locals.forms, ...JSON.parse(JSON.stringify(rows))];
        res.status(200).json(merged);
      }
    }
  );
});

/**
 * MAKING A DECISION TIME!!!!
 */
router.post("/decisions", (req, res, next) => {
  let appData = {};
  const accepted = "Congratulations, your claim has been accepted!";
  const denied = "We're sorry to inform you that your claim has been denied";
  const claimId = req.body.claimId;
  const data = {
    userId: req.body.employeeId,
    decision: req.body.decision,
    content: !!+req.body.decision ? accepted : denied,
    consent: JSON.stringify({
      boolean: 1,
      signature: "Auth",
      dateSigned: new Date()
    }),
    createdAt: new Date()
  };
  const type = "letter";
  const name = "Letter of " + (!!+req.body.decision ? "Approval" : "Denial");
  database.query("INSERT INTO Letter SET ?", data, function(err, rows, fields) {
    if (err) {
      console.log(err);
      appData.error = 1;
      appData["data"] = err;
      res.status(400).json(appData);
    } else {
      res.locals.docData = {
        claimId: claimId,
        referenceID: rows.insertId,
        name: name,
        type: type,
        createdAt: data.createdAt
      };
      res.locals.claimId = claimId;
      res.locals.data = data;
      next();
    }
  });
});
/**
 * REFERENCE LETTER IN DOCUMENTS
 */
router.post("/decisions", (req, res, next) => {
  let appData = {};
  const docData = res.locals.docData;
  database.query("INSERT INTO Document SET ?", docData, function(
    err,
    rows,
    fields
  ) {
    if (err) {
      console.log(err);
      appData.error = 1;
      appData["data"] = err;
      res.status(400).json(appData);
    } else {
      res.locals.docId = rows.insertId;
      next();
    }
  });
});

/**
 * Get Claim actionRequired object
 */
router.post("/decisions", (req, res, next) => {
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
 * Update Claim with Document Id
 */
router.post("/decisions", (req, res, next) => {
  let appData = {};
  const docId = res.locals.docId;
  const notNull = "," + docId;
  const claimId = res.locals.claimId;
  let alteredActions = JSON.parse(res.locals.actionRequired);
  alteredActions.adjudicatorId = { state: 0, message: "" };
  alteredActions = JSON.stringify(alteredActions);
  database.query(
    "UPDATE Claim SET documents = IFNULL(CONCAT(documents, ?),?), actionRequired = ?, adjudicator = ? WHERE id = ?",
    [notNull, docId, alteredActions, 1, claimId],
    function(err, rows, fields) {
      if (err) {
        console.log(err);
        appData.error = 1;
        appData["data"] = err;
        res.status(400).json(appData);
      } else {
        next();
      }
    }
  );
});

/**
 * Update Node Array
 */
router.post("/decisions", (req, res, next) => {
  let appData = {};
  const claimId = res.locals.claimId;
  database.query(
    "SELECT Step3 FROM NodeArray WHERE claimId = ?",
    claimId,
    function(err, rows, fields) {
      if (err) {
        console.log(err);
        appData.error = 1;
        appData["data"] = "Error Occured!";
        res.status(400).json(appData);
      } else {
        res.locals.startDate = JSON.parse(rows[0].Step3).startDate;
        next();
      }
    }
  );
});

/**
 * Update Node Array
 */
router.post("/decisions", (req, res, next) => {
  let appData = {};
  const claimId = res.locals.claimId;
  const startDate = res.locals.startDate;
  const date = new Date();
  const nodeArray = [
    {
      name: "Under Review",
      details:
        "All information required to make a decision on your claim has been recieved.",
      state: 1,
      nextSteps:
        "You will receive a notification when the adjudicator has made a decision on your claim, this can take up to 3 days.",
      startDate: startDate,
      endDate: date
    },
    {
      name: "Decision",
      details: "A decision on your claim has been made.",
      state: 1,
      nextSteps:
        "You should now be able to view your benefits in the documents section of your portal. Please review the decision.",
      startDate: date,
      endDate: date
    }
  ];

  database.query(
    "UPDATE NodeArray SET Step3 = ?, Step4 = ? WHERE claimId = ?",
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
        res.status(201).json(appData);
      }
    }
  );
});

module.exports = router;
