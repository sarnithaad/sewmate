// routes/customers.js
const express = require("express");
const router = express.Router();
const db = require("../db");
const authenticate = require("../middleware/auth");

// Add a new customer
router.post("/", authenticate, async (req, res) => {
  const shopkeeperId = req.shopkeeperId;
  const { name, mobile, address } = req.body;
  try {
    const [result] = await db.execute(
      "INSERT INTO customers (shopkeeper_id, name, mobile, address) VALUES (?, ?, ?, ?)",
      [shopkeeperId, name, mobile, address]
    );
    res.json({ message: "Customer added", customerId: result.insertId });
  } catch (err) {
    res.status(500).json({ error: "Database error" });
  }
});

// Get all customers for the logged-in shopkeeper
router.get("/", authenticate, async (req, res) => {
  const shopkeeperId = req.shopkeeperId;
  try {
    const [customers] = await db.execute(
      "SELECT * FROM customers WHERE shopkeeper_id = ?",
      [shopkeeperId]
    );
    res.json(customers);
  } catch (err) {
    res.status(500).json({ error: "Database error" });
  }
});

module.exports = router;
