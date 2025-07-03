const mysql = require("mysql2");
const pool = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "Sharnitha@2003", // replace with your password
  database: "sewmate"
});
module.exports = pool.promise();
