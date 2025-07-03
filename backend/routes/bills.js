// routes/bills.js
const express = require("express");
const router = express.Router();
const db = require("../db");
const authenticate = require("../middleware/auth");

// Create a new bill
router.post("/", authenticate, async (req, res) => {
  const shopkeeperId = req.shopkeeperId;
  const { customer_name, due_date, total_value } = req.body;
  try {
    const [result] = await db.execute(
      "INSERT INTO bills (shopkeeper_id, customer_name, due_date, total_value) VALUES (?, ?, ?, ?)",
      [shopkeeperId, customer_name, due_date, total_value]
    );
    res.json({ message: "Bill created", billId: result.insertId });
  } catch (err) {
    res.status(500).json({ error: "Database error" });
  }
});

// Get all bills for the logged-in shopkeeper
router.get("/", authenticate, async (req, res) => {
  const shopkeeperId = req.shopkeeperId;
  try {
    const [bills] = await db.execute(
      "SELECT * FROM bills WHERE shopkeeper_id = ?",
      [shopkeeperId]
    );
    res.json(bills);
  } catch (err) {
    res.status(500).json({ error: "Database error" });
  }
});

// Dashboard deliveries: overdue, today, next 2 days
router.get("/dashboard-deliveries", authenticate, async (req, res) => {
  const shopkeeperId = req.shopkeeperId;
  const today = new Date();
  const todayStr = today.toISOString().slice(0, 10);
  const next2 = new Date(today);
  next2.setDate(today.getDate() + 2);
  const next2Str = next2.toISOString().slice(0, 10);

  try {
    // Overdue: due_date < today
    const [overdue] = await db.execute(
      "SELECT * FROM bills WHERE shopkeeper_id = ? AND due_date < ?",
      [shopkeeperId, todayStr]
    );
    // Today: due_date = today
    const [todayDeliveries] = await db.execute(
      "SELECT * FROM bills WHERE shopkeeper_id = ? AND due_date = ?",
      [shopkeeperId, todayStr]
    );
    // Next 2 days: due_date > today AND due_date <= today+2
    const [upcoming] = await db.execute(
      "SELECT * FROM bills WHERE shopkeeper_id = ? AND due_date > ? AND due_date <= ?",
      [shopkeeperId, todayStr, next2Str]
    );
    res.json({ overdue, today: todayDeliveries, upcoming });
  } catch (err) {
    res.status(500).json({ error: "Database error" });
  }
});

module.exports = router;
