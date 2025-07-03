const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const router = express.Router();

// Replace with your actual DB logic
const db = require("../db"); // Example: your DB connection
const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret";

// Registration
router.post("/register", async (req, res) => {
  const { shop_name, owner_name, email, password, mobile, address } = req.body;
  if (!shop_name || !owner_name || !email || !password || !mobile) {
    return res.status(400).json({ error: "All fields except address are required." });
  }
  // Check if email exists
  const exists = await db.shopkeepers.findOne({ email });
  if (exists) return res.status(400).json({ error: "Email already registered." });

  const hashedPassword = await bcrypt.hash(password, 10);
  const newShopkeeper = {
    shop_name,
    owner_name,
    email,
    password: hashedPassword,
    mobile,
    address
  };
  const result = await db.shopkeepers.insertOne(newShopkeeper);
  res.json({ message: "Registration successful!" });
});

// Login
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const shopkeeper = await db.shopkeepers.findOne({ email });
  if (!shopkeeper) return res.status(401).json({ error: "Invalid credentials" });

  const valid = await bcrypt.compare(password, shopkeeper.password);
  if (!valid) return res.status(401).json({ error: "Invalid credentials" });

  const token = jwt.sign(
    { id: shopkeeper._id || shopkeeper.id, email: shopkeeper.email },
    JWT_SECRET,
    { expiresIn: "7d" }
  );
  res.json({
    token,
    shopkeeper: {
      id: shopkeeper._id || shopkeeper.id,
      shop_name: shopkeeper.shop_name,
      owner_name: shopkeeper.owner_name,
      email: shopkeeper.email,
      mobile: shopkeeper.mobile,
      address: shopkeeper.address
    }
  });
});

module.exports = router;
