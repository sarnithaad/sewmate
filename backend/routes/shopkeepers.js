// routes/shopkeepers.js
const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const router = express.Router();
const db = require("../db");
const JWT_SECRET = process.env.JWT_SECRET || "Sharnitha@2003";

// Registration
router.post("/register", async (req, res) => {
  const { shop_name, owner_name, email, password, mobile, address } = req.body;
  if (!shop_name || !owner_name || !email || !password || !mobile) {
    return res.status(400).json({ error: "All fields except address are required." });
  }
  try {
    const [rows] = await db.execute("SELECT id FROM shopkeepers WHERE email = ?", [email]);
    if (rows.length > 0) return res.status(400).json({ error: "Email already registered." });

    const hashedPassword = await bcrypt.hash(password, 10);
    await db.execute(
      "INSERT INTO shopkeepers (shop_name, owner_name, email, password, mobile, address) VALUES (?, ?, ?, ?, ?, ?)",
      [shop_name, owner_name, email, hashedPassword, mobile, address]
    );
    res.json({ message: "Registration successful!" });
  } catch (err) {
  console.error(err); // This will show the full error in Render logs
  res.status(500).json({ error: "Database error" });
}
});

// Login
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const [rows] = await db.execute("SELECT * FROM shopkeepers WHERE email = ?", [email]);
    if (rows.length === 0) return res.status(401).json({ error: "Invalid credentials" });

    const shopkeeper = rows[0];
    const valid = await bcrypt.compare(password, shopkeeper.password);
    if (!valid) return res.status(401).json({ error: "Invalid credentials" });

    const token = jwt.sign(
      { id: shopkeeper.id, email: shopkeeper.email },
      JWT_SECRET,
      { expiresIn: "7d" }
    );
    res.json({
      token,
      shopkeeper: {
        id: shopkeeper.id,
        shop_name: shopkeeper.shop_name,
        owner_name: shopkeeper.owner_name,
        email: shopkeeper.email,
        mobile: shopkeeper.mobile,
        address: shopkeeper.address
      }
    });
  } catch (err) {
    res.status(500).json({ error: "Database error" });
  }
});

module.exports = router;
