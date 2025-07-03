const express = require("express");
const db = require("../db");
const router = express.Router();

router.post("/", async (req, res) => {
  const { shopkeeper_id, name, mobile, order_date, due_date, bill_value } = req.body;
  try {
    await db.execute(
      "INSERT INTO customers (shopkeeper_id, name, mobile, order_date, due_date, bill_value) VALUES (?, ?, ?, ?, ?, ?)",
      [shopkeeper_id, name, mobile, order_date, due_date, bill_value]
    );
    res.status(201).json({ message: "Customer added" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.get("/:shopkeeper_id", async (req, res) => {
  const { shopkeeper_id } = req.params;
  try {
    const [rows] = await db.execute(
      "SELECT * FROM customers WHERE shopkeeper_id = ?",
      [shopkeeper_id]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
