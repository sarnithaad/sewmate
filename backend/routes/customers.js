const express = require("express");
const router = express.Router();
const db = require("../db");
const authenticate = require("../middleware/auth");

// ✅ Add a new customer
router.post("/", authenticate, async (req, res) => {
  const shopkeeperId = req.shopkeeperId;
  const { name, mobile, address } = req.body;

  if (!name || !mobile) {
    return res.status(400).json({ error: "Customer name and mobile are required." });
  }

  try {
    // Optional: Prevent duplicate entries
    const [existing] = await db.execute(
      "SELECT id FROM customers WHERE shopkeeper_id = ? AND mobile = ?",
      [shopkeeperId, mobile]
    );
    if (existing.length > 0) {
      return res.status(409).json({ error: "Customer with this mobile already exists." });
    }

    const [result] = await db.execute(
      "INSERT INTO customers (shopkeeper_id, name, mobile, address) VALUES (?, ?, ?, ?)",
      [shopkeeperId, name.trim(), mobile.trim(), address || ""]
    );

    res.status(201).json({ message: "Customer added", customerId: result.insertId });
  } catch (err) {
    console.error("Add customer error:", err);
    res.status(500).json({ error: "Database error adding customer" });
  }
});

// ✅ Get all customers for the logged-in shopkeeper
router.get("/", authenticate, async (req, res) => {
  const shopkeeperId = req.shopkeeperId;
  try {
    const [customers] = await db.execute(
      "SELECT id, name, mobile, address FROM customers WHERE shopkeeper_id = ? ORDER BY name ASC",
      [shopkeeperId]
    );
    res.json(customers);
  } catch (err) {
    console.error("Fetch customers error:", err);
    res.status(500).json({ error: "Database error fetching customers" });
  }
});

module.exports = router;
