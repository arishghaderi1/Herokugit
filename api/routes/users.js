const express = require("express");
const router = express.Router();
const database = require("../db");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

const genRandomString = function(length) {
  return crypto
    .randomBytes(Math.ceil(length / 2))
    .toString("hex") /** convert to hexadecimal format */
    .slice(0, length); /** return required number of characters */
};

const sha512 = function(password, salt) {
  const hash = crypto.createHmac(
    "sha512",
    salt
  ); /** Hashing algorithm sha512 */
  hash.update(password);
  const value = hash.digest("hex");
  return {
    salt: salt,
    passwordHash: value
  };
};

const saltHashPassword = function(userpassword, userSalt = null) {
  const salt =
    userSalt === null
      ? genRandomString(12)
      : userSalt; /** Gives us salt of length 12 */
  const passwordData = sha512(userpassword, salt);
  return { hashed: passwordData.passwordHash, salt: passwordData.salt };
};

process.env.SECRET_KEY = "wsib_potatoes";

// Register a new user
router.post("/demoRegister/:id", function(req, res) {
  const today = new Date();
  let appData = {
    error: 1,
    data: ""
  };

  let password = req.body.password;

  const result = saltHashPassword(password);

  let companyId;
  if (req.body.view === "employee") {
    companyId = 1;
  } else if (req.body.view === "employer") {
    companyId = 4;
  } else if (req.body.view === "wsib") {
    companyId = 2;
  } else {
    companyId = 3;
  }

  const userData = {
    name: req.body.name,
    email: req.body.email,
    password: result.hashed,
    salt: result.salt,
    view: req.body.view,
    companyId: companyId,
    created_at: today
  };

  database.query(
    "UPDATE User SET ? WHERE id=?",
    [userData, req.params.id],
    function(err, rows, fields) {
      if (!err) {
        appData.error = 0;
        appData["data"] = "User registered successfully!";
        res.status(201).json(appData);
      } else {
        appData["data"] = "Error Occured!";
        res.status(400).json(appData);
      }
    }
  );
});

// Register a new user
router.post("/register", function(req, res) {
  const today = new Date();
  let appData = {
    error: 1,
    data: ""
  };

  let password = req.body.password;

  const result = saltHashPassword(password);

  const userData = {
    name: req.body.name,
    email: req.body.email,
    password: result.hashed,
    salt: result.salt,
    view: "employee",
    created_at: today
  };

  database.query("INSERT INTO User SET ?", userData, function(
    err,
    rows,
    fields
  ) {
    if (!err) {
      appData.error = 0;
      appData["data"] = "User registered successfully!";
      res.status(201).json(appData);
    } else {
      appData["data"] = "Error Occured!";
      res.status(400).json(appData);
    }
  });
});

// Login user
router.post("/login", function(req, res, next) {
  let appData = {};
  let user = {
    email: req.body.email,
    password: req.body.password,
    salt: ""
  };
  database.query("SELECT salt FROM User WHERE email = ?", user.email, function(
    err,
    rows,
    fields
  ) {
    if (err) {
      console.log(err);
      appData.error = 1;
      appData["auth"] = false;
      appData["data"] = "Error Occured!";
      res.status(400).json(appData);
    } else {
      user.salt = rows[0].salt;
      res.locals.user = user;
      next();
    }
  });
});

router.post("/login", function(req, res, next) {
  let appData = {};
  const user = res.locals.user;
  database.query("SELECT * FROM User WHERE email = ?", user.email, function(
    err,
    rows,
    fields
  ) {
    if (err) {
      appData.error = 1;
      appData["auth"] = false;
      appData["data"] = "Error Occured!";
      res.status(400).json(appData);
    } else {
      if (rows.length > 0) {
        const result = saltHashPassword(user.password, user.salt);
        if (rows[0].password === result.hashed) {
          const token = jwt.sign({ data: rows[0].id }, process.env.SECRET_KEY, {
            expiresIn: 604800
          });
          appData.error = 0;
          appData["auth"] = true;
          appData["token"] = token;
          appData["data"] = rows[0];
          res.status(200).json(appData);
        } else {
          appData.error = 1;
          appData["auth"] = false;
          appData["data"] = "Email and Password does not match";
          res.status(404).json(appData);
        }
      } else {
        appData.error = 1;
        appData["auth"] = false;
        appData["data"] = "Email does not exists!";
        res.status(404).json(appData);
      }
    }
  });
});

router.use(function(req, res, next) {
  const token = req.body.token || req.headers["token"];
  let appData = {};
  if (token) {
    jwt.verify(token, process.env.SECRET_KEY, function(err) {
      if (err) {
        appData["error"] = 1;
        appData["auth"] = false;
        appData["data"] = "Token is invalid";
        appData["action"] = "login";
        res.status(500).json(appData);
      } else {
        next();
      }
    });
  } else {
    appData["error"] = 1;
    appData["auth"] = false;
    appData["data"] = "Please send a token";
    res.status(403).json(appData);
  }
});

router.get("/getUsers", function(req, res) {
  const token = req.body.token || req.headers["token"];
  let appData = {};
  database.query("SELECT * FROM User", function(err, rows, fields) {
    if (!err) {
      appData["error"] = 0;
      appData["data"] = rows;
      res.status(200).json(appData);
    } else {
      appData["data"] = "No data found";
      res.status(404).json(appData);
    }
  });
});

router.get("/getUser/:userId", function(req, res) {
  const token = req.body.token || req.headers["token"];
  let appData = {};
  database.query("SELECT * FROM User Where id = ?", req.params.userId, function(err, rows, fields) {
    if (!err) {
      appData["error"] = 0;
      appData["data"] = rows;
      res.status(200).json(appData);
    } else {
      appData["data"] = "No data found";
      res.status(404).json(appData);
    }
  });
});

router.get("/login", function(req, res, next) {
  let appData = {};
  const token = req.body.token || req.headers["token"];
  if (token) {
    jwt.verify(token, process.env.SECRET_KEY, function(err, id) {
      database.query("SELECT * FROM User WHERE id = ?", id.data, function(
        err,
        rows,
        fields
      ) {
        if (err) {
          appData.error = 1;
          appData["auth"] = false;
          appData["data"] = "Error Occured!";
          res.status(400).json(appData);
        } else {
          appData.error = 0;
          appData["auth"] = true;
          appData["token"] = token;
          appData["data"] = rows[0];
          res.status(200).json(appData);
        }
      });
    });
  } else {
    appData.error = 1;
    appData["auth"] = false;
    appData["data"] = "No token provided!";
    res.status(400).json(appData);
  }
});

router.post("/changePassword", (req, res, next) => {
  const today = new Date();
  let appData = {
    error: 1,
    data: ""
  };
  let password = req.body.password;

  const result = saltHashPassword(password);

  const userData = {
    email: req.body.email,
    password: result.hashed,
    salt: result.salt,
    updated_at: today
  };

  database.query(
    "UPDATE User SET password=?, salt=? WHERE email=?",
    [userData.password, userData.salt, userData.email],
    function(err, rows, fields) {
      if (!err) {
        appData.error = 0;
        appData["data"] = "Password successfully changed!";
        res.status(200).json(appData);
      } else {
        appData["data"] = "Error Occured!";
        res.status(400).json(appData);
      }
    }
  );
});

router.post("/updateUserInfo", (req, res, next) => {
  let appData = {
    error: 1,
    data: ""
  };

  database.query(
    "UPDATE User SET ? WHERE id=?",
    [req.body, req.body.id],
    function(err, rows, fields) {
      if (!err) {
        appData.error = 0;
        appData["data"] = "User info updated!";
        res.status(201).json(appData);
      } else {
        appData["data"] = "Error Occured";
        res.status(400).json(appData);
      }
    }
  );
});

router.delete("/:userId", (req, res, next) => {
  res.status(200).json({
    message: "Deleted product"
  });
});

module.exports = router;
