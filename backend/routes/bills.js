const express = require("express");
const router = express.Router();
const db = require("../db");
const authenticate = require("../middleware/auth");

// ✅ Create a new bill
router.post("/", authenticate, async (req, res) => {
  const shopkeeperId = req.shopkeeperId;
  const {
    bill_number,
    customer_name,
    mobile,
    dress_type,
    order_date,
    due_date,
    measurements = {},
    extras = [],
    total_value
  } = req.body;

  const conn = await db.getConnection();
  await conn.beginTransaction();

  try {
    // 1. Insert into bills table
    const [billResult] = await conn.execute(
      `INSERT INTO bills 
        (shopkeeper_id, bill_number, customer_name, mobile, dress_type, order_date, due_date, total_value, status) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'Booked')`,
      [
        shopkeeperId,
        bill_number,
        customer_name,
        mobile,
        dress_type,
        order_date,
        due_date,
        total_value
      ]
    );

    const billId = billResult.insertId;

    // 2. Insert measurements (stored as JSON in DB or another table)
    await conn.execute(
      `INSERT INTO bill_details (bill_id, measurements_json, extras_json) VALUES (?, ?, ?)`,
      [billId, JSON.stringify(measurements), JSON.stringify(extras)]
    );

    await conn.commit();
    res.status(201).json({ message: "Bill created", billId });
  } catch (err) {
    await conn.rollback();
    console.error("Bill creation error:", err);
    res.status(500).json({ error: "Failed to create bill" });
  } finally {
    conn.release();
  }
});

// ✅ Get all bills for current shopkeeper
router.get("/", authenticate, async (req, res) => {
  const shopkeeperId = req.shopkeeperId;
  try {
    const [bills] = await db.execute(
      "SELECT b.*, d.measurements_json, d.extras_json FROM bills b LEFT JOIN bill_details d ON b.id = d.bill_id WHERE b.shopkeeper_id = ?",
      [shopkeeperId]
    );
    res.json(bills);
  } catch (err) {
    console.error("Fetch bills error:", err);
    res.status(500).json({ error: "Database error fetching bills" });
  }
});

// ✅ Dashboard - overdue, today, upcoming
router.get("/dashboard-deliveries", authenticate, async (req, res) => {
  const shopkeeperId = req.shopkeeperId;
  const today = new Date();
  const todayStr = today.toISOString().slice(0, 10);
  const next2Str = new Date(today.setDate(today.getDate() + 2)).toISOString().slice(0, 10);

  try {
    const [overdue] = await db.execute(
      "SELECT * FROM bills WHERE shopkeeper_id = ? AND due_date < ? AND status != 'Delivered'",
      [shopkeeperId, todayStr]
    );
    const [todayBills] = await db.execute(
      "SELECT * FROM bills WHERE shopkeeper_id = ? AND due_date = ? AND status != 'Delivered'",
      [shopkeeperId, todayStr]
    );
    const [upcoming] = await db.execute(
      "SELECT * FROM bills WHERE shopkeeper_id = ? AND due_date > ? AND due_date <= ? AND status != 'Delivered'",
      [shopkeeperId, todayStr, next2Str]
    );
    res.json({ overdue, today: todayBills, upcoming });
  } catch (err) {
    console.error("Dashboard delivery fetch error:", err);
    res.status(500).json({ error: "Failed to load delivery dashboard" });
  }
});

// ✅ Get bills for calendar view by selected date
router.get("/by-date/:date", authenticate, async (req, res) => {
  const shopkeeperId = req.shopkeeperId;
  const date = req.params.date;
  try {
    const [bills] = await db.execute(
      "SELECT * FROM bills WHERE shopkeeper_id = ? AND due_date = ?",
      [shopkeeperId, date]
    );
    res.json(bills);
  } catch (err) {
    res.status(500).json({ error: "Failed to load bills for date" });
  }
});

// ✅ Update bill status (e.g., "Packed", "Delivered", etc.)
router.post("/status", authenticate, async (req, res) => {
  const { bill_id, status, status_date } = req.body;
  try {
    await db.execute(
      "UPDATE bills SET status = ?, status_date = ? WHERE id = ?",
      [status, status_date, bill_id]
    );
    res.json({ message: "Status updated" });
  } catch (err) {
    console.error("Status update error:", err);
    res.status(500).json({ error: "Failed to update bill status" });
  }
});

// ✅ Delete delivered bills (when status is "Delivered")
router.delete("/delivered/:id", authenticate, async (req, res) => {
  const billId = req.params.id;
  try {
    await db.execute("DELETE FROM bills WHERE id = ? AND status = 'Delivered'", [billId]);
    await db.execute("DELETE FROM bill_details WHERE bill_id = ?", [billId]);
    res.json({ message: "Delivered bill deleted" });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete delivered bill" });
  }
});

// ✅ Get overdue bills not packed 1 day before due date
router.get("/overdue/:shopkeeperId", async (req, res) => {
  const shopkeeperId = req.params.shopkeeperId;
  const todayStr = new Date().toISOString().slice(0, 10);
  try {
    const [rows] = await db.execute(
      `SELECT * FROM bills 
       WHERE shopkeeper_id = ? 
         AND status NOT IN ('Packed', 'Delivered') 
         AND DATE(due_date) <= DATE_SUB(?, INTERVAL -1 DAY)`,
      [shopkeeperId, todayStr]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: "Error fetching overdue tasks" });
  }
});

module.exports = router;
