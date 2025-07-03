const express = require("express");
const db = require("../db");
const router = express.Router();

router.post("/", async (req, res) => {
  const { shopkeeper_id, customer_id, bill_number, dress_type, order_date, due_date, total_value, details, others } = req.body;
  try {
    await db.execute(
      "INSERT INTO bills (shopkeeper_id, customer_id, bill_number, dress_type, order_date, due_date, total_value, details, others) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
      [shopkeeper_id, customer_id, bill_number, dress_type, order_date, due_date, total_value, JSON.stringify(details), others]
    );
    res.status(201).json({ message: "Bill created" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.get("/:shopkeeper_id", async (req, res) => {
  const { shopkeeper_id } = req.params;
  try {
    const [rows] = await db.execute(
      `SELECT b.*, c.name as customer_name, c.mobile FROM bills b
       JOIN customers c ON b.customer_id = c.id
       WHERE b.shopkeeper_id = ? ORDER BY b.due_date ASC`,
      [shopkeeper_id]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/status", async (req, res) => {
  const { bill_id, status, status_date } = req.body;
  try {
    await db.execute(
      "INSERT INTO bill_status (bill_id, status, status_date) VALUES (?, ?, ?)",
      [bill_id, status, status_date]
    );
    await db.execute(
      "UPDATE bills SET status = ? WHERE id = ?",
      [status, bill_id]
    );
    res.json({ message: "Status updated" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
