const express = require("express");
const router = express.Router();

const ADMIN_EMAIL = "admin@example.com";
const ADMIN_PASSWORD = "admin123"; // Plain text password

router.post("/login", (req, res) => {
  const { email, password } = req.body;
  console.log("LOGIN ATTEMPT:", email, password); // Debug log
  if (email !== ADMIN_EMAIL || password !== ADMIN_PASSWORD) {
    return res.status(401).json({ error: "Invalid credentials" });
  }
  res.json({ admin: true, email: ADMIN_EMAIL });
});

module.exports = router;
