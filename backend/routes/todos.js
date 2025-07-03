// routes/todos.js
const express = require("express");
const router = express.Router();
const db = require("../db");
const authenticate = require("../middleware/auth");

// Add a new todo/task
router.post("/", authenticate, async (req, res) => {
  const shopkeeperId = req.shopkeeperId;
  const { task, due_date, status } = req.body;
  try {
    const [result] = await db.execute(
      "INSERT INTO todos (shopkeeper_id, task, due_date, status) VALUES (?, ?, ?, ?)",
      [shopkeeperId, task, due_date, status || "pending"]
    );
    res.json({ message: "Todo added", todoId: result.insertId });
  } catch (err) {
    res.status(500).json({ error: "Database error" });
  }
});

// Get all todos for the logged-in shopkeeper
router.get("/", authenticate, async (req, res) => {
  const shopkeeperId = req.shopkeeperId;
  try {
    const [todos] = await db.execute(
      "SELECT * FROM todos WHERE shopkeeper_id = ?",
      [shopkeeperId]
    );
    res.json(todos);
  } catch (err) {
    res.status(500).json({ error: "Database error" });
  }
});

module.exports = router;
