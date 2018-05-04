const express = require("express");
const app = express();
const morgan = require("morgan");
const bodyParser = require("body-parser");
const jwt = require("jsonwebtoken");
const cors = require("cors");

const userRoutes = require("./api/routes/users");
const claimRoutes = require("./api/routes/claims");
const employerRoutes = require("./api/routes/employers");
const doctorRoutes = require("./api/routes/doctors");
const notificationRoutes = require("./api/routes/notifications");

app.use(cors());

// Parse body of requests
app.use(morgan("dev"));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// CORS config
app.use((res, req, next) => {
  res.header("Access-Control-All-Origin", "*");
  res.header(
    "Access-Control-Allow-Methods",
    "PUT, POST, PATCH, DELETE, GET, OPTIONS"
  );
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  next();
});

// Used to Login or Register
app.use("/users", userRoutes);

// JSON Web Token
app.use((req, res, next) => {
  const token = req.body.token || req.headers["token"];
  let appData = {};
  if (token) {
    jwt.verify(token, process.env.SECRET_KEY, function(err) {
      if (err) {
        appData["error"] = 1;
        appData["data"] = "Token is invalid";
        appData["action"] = "login";
        res.status(500).json(appData);
      } else {
        next();
      }
    });
  } else {
    appData["error"] = 1;
    appData["data"] = "Please send a token";
    appData["action"] = "login";
    res.status(403).json(appData);
  }
});

// Routes which handle requests
app.use("/claims", claimRoutes);
app.use("/employers", employerRoutes);
app.use("/doctors", doctorRoutes);
app.use("/notifications", notificationRoutes);

// Error handling
app.use((req, res, next) => {
  const error = new Error("Route not found");
  error.status = 404;
  next(error);
});

app.use((error, req, res, next) => {
  res.status(error.status || 500);
  res.json({
    error: {
      message: error.message
    }
  });
});

module.exports = app;
