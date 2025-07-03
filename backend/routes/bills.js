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
      "SELECT b.*, d.measurements_json, d.extras_json FROM bills b LEFT JOIN bill_details d ON b.id = d.bill_id WHERE b.shopkeeper_id =_*
