const express = require("express");
const router = express.Router();
const database = require("../db.js");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

const genRandomString = function(length) {
  return crypto
    .randomBytes(Math.ceil(length / 2))
    .toString("hex") /** convert to hexadecimal format */
    .slice(0, length); /** return required number of characters */
};

const sha512 = function(password, salt) {
  var hash = crypto.createHmac("sha512", salt); /** Hashing algorithm sha512 */
  hash.update(password);
  var value = hash.digest("hex");
  return {
    salt: salt,
    passwordHash: value
  };
};

process.env.SECRET_KEY = "wsib_potatoes";

// Register a new user
router.post("/register", function(req, res) {
  const today = new Date();
  let appData = {
    error: 1,
    data: ""
  };
  let password = req.body.password;

  function saltHashPassword(userpassword) {
    var salt = genRandomString(12); /** Gives us salt of length 12 */
    var passwordData = sha512(userpassword, salt);
    return { hashed: passwordData.passwordHash, salt: passwordData.salt };
  }

  const result = saltHashPassword(password);

  const userData = {
    name: req.body.name,
    email: req.body.email,
    password_digest: result.hashed,
    salt: result.salt,
    view: "employee",
    created_at: today
  };

  database.connection.getConnection(function(err, connection) {
    if (err) {
      appData["error"] = 1;
      appData["data"] = "Internal Server Error";
      res.status(500).json(appData);
    } else {
      connection.query("INSERT INTO users SET ?", userData, function(
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
      connection.release();
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
  database.connection.getConnection(function(err, connection) {
    if (err) {
      appData["error"] = 1;
      appData["auth"] = false;
      appData["data"] = "Internal Server Error";
      res.status(500).json(appData);
    } else {
      connection.query(
        "SELECT salt FROM users WHERE email = ?",
        user.email,
        function(err, rows, fields) {
          if (err) {
            appData.error = 1;
            appData["auth"] = false;
            appData["data"] = "Error Occured!";
            res.status(400).json(appData);
          } else {
            user.salt = rows[0].salt;
            res.locals.user = user;
            next();
          }
        }
      );
    }
  });
});

router.post("/login", function(req, res, next) {
  let appData = {};
  const user = res.locals.user;
  database.connection.getConnection(function(err, connection) {
    if (err) {
      appData["error"] = 1;
      appData["auth"] = false;
      appData["data"] = "Internal Server Error";
      res.status(500).json(appData);
    } else {
      connection.query(
        "SELECT * FROM users WHERE email = ?",
        user.email,
        function(err, rows, fields) {
          if (err) {
            appData.error = 1;
            appData["auth"] = false;
            appData["data"] = "Error Occured!";
            res.status(400).json(appData);
          } else {
            if (rows.length > 0) {
              function saltHashPassword(userpassword) {
                var salt = user.salt; /** Use Found Salt */
                var passwordData = sha512(userpassword, salt);
                return { hashed: passwordData.passwordHash };
              }

              const result = saltHashPassword(user.password);

              if (rows[0].password_digest === result.hashed) {
                const token = jwt.sign(
                  { data: rows[0].id },
                  process.env.SECRET_KEY,
                  {
                    expiresIn: 604800
                  }
                );
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
        }
      );
      connection.release();
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
  database.connection.getConnection(function(err, connection) {
    if (err) {
      appData["error"] = 1;
      appData["data"] = "Internal Server Error";
      res.status(500).json(appData);
    } else {
      connection.query("SELECT *FROM users", function(err, rows, fields) {
        if (!err) {
          appData["error"] = 0;
          appData["data"] = rows;
          res.status(200).json(appData);
        } else {
          appData["data"] = "No data found";
          res.status(404).json(appData);
        }
      });
      connection.release();
    }
  });
});

router.get("/login", function(req, res, next) {
  let appData = {};
  const token = req.body.token || req.headers["token"];
  if (token) {
    jwt.verify(token, process.env.SECRET_KEY, function(err, id) {
      database.connection.getConnection(function(err, connection) {
        if (err) {
          appData["error"] = 1;
          appData["auth"] = false;
          appData["data"] = "Improper Token";
          res.status(400).json(appData);
        } else {
          connection.query(
            "SELECT * FROM users WHERE id = ?",
            id.data,
            function(err, rows, fields) {
              if (err) {
                appData.error = 1;
                appData["auth"] = false;
                appData["data"] = "Error Occured!";
                res.status(400).json(appData);
              } else {
                const token = jwt.sign(
                  { data: rows[0].id },
                  process.env.SECRET_KEY,
                  {
                    expiresIn: 604800
                  }
                );
                appData.error = 0;
                appData["auth"] = true;
                appData["token"] = token;
                appData["data"] = rows[0];
                res.status(200).json(appData);
              }
            }
          );
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

router.patch("/:userId", (req, res, next) => {
  res.status(200).json({
    message: "Updated product"
  });
});

router.delete("/:userId", (req, res, next) => {
  res.status(200).json({
    message: "Deleted product"
  });
});

module.exports = router;
