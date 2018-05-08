const mysql = require("mysql");

const connection = mysql.createPool({
  host: process.env.db_host,
  user: process.env.db_username,
  password: process.env.db_password,
  database: process.env.db_name,
  port: process.env.db_port
});

module.exports = connection;
