const express = require("express");
const db = require("../db");
const router = express.Router();

router.get("/:shopkeeper_id", async (req, res) => {
  const { shopkeeper_id } = req.params;
  try {
    const [rows] = await db.execute(
      `SELECT t.*, b.bill_number, b.status, c.name as customer_name
       FROM todos t
       JOIN bills b ON t.bill_id = b.id
       JOIN customers c ON b.customer_id = c.id
       WHERE t.shopkeeper_id = ? AND t.completed = FALSE
       ORDER BY t.due_date ASC`,
      [shopkeeper_id]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
