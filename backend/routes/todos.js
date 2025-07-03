const express = require("express");
const router = express.Router();
const db = require("../db");
const authenticate = require("../middleware/auth");

// Utility validation
const isEmpty = val => !val || val.trim() === "";

// ✅ Add a new todo/task
router.post("/", authenticate, async (req, res) => {
  const shopkeeperId = req.shopkeeperId;
  const { task, due_date, status = "pending" } = req.body;

  // Basic validation
  if (isEmpty(task) || isEmpty(due_date)) {
    return res.status(400).json({ error: "Task and due date are required." });
  }

  try {
    const [result] = await db.execute(
      "INSERT INTO todos (shopkeeper_id, task, due_date, status) VALUES (?, ?, ?, ?)",
      [shopkeeperId, task.trim(), due_date, status.trim().toLowerCase()]
    );
    res.status(201).json({ message: "Todo added successfully", todoId: result.insertId });
  } catch (err) {
    console.error("Error inserting todo:", err);
    res.status(500).json({ error: "Database error while adding todo." });
  }
});

// ✅ Get all todos for the logged-in shopkeeper
router.get("/", authenticate, async (req, res) => {
  const shopkeeperId = req.shopkeeperId;
  try {
    const [todos] = await db.execute(
      `SELECT id, task, due_date, status, created_at
       FROM todos
       WHERE shopkeeper_id = ?
       ORDER BY due_date ASC`,
      [shopkeeperId]
    );
    res.json(todos);
  } catch (err) {
    console.error("Error fetching todos:", err);
    res.status(500).json({ error: "Database error while fetching todos." });
  }
});

// ✅ (Optional) Update todo status
router.patch("/:id/status", authenticate, async (req, res) => {
  const shopkeeperId = req.shopkeeperId;
  const todoId = req.params.id;
  const { status } = req.body;

  if (!status) return res.status(400).json({ error: "Status is required." });

  try {
    const [result] = await db.execute(
      `UPDATE todos SET status = ? WHERE id = ? AND shopkeeper_id = ?`,
      [status.trim().toLowerCase(), todoId, shopkeeperId]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Todo not found or unauthorized." });
    }
    res.json({ message: "Status updated successfully" });
  } catch (err) {
    console.error("Error updating status:", err);
    res.status(500).json({ error: "Database error while updating status." });
  }
});

// ✅ (Optional) Delete todo
router.delete("/:id", authenticate, async (req, res) => {
  const shopkeeperId = req.shopkeeperId;
  const todoId = req.params.id;

  try {
    const [result] = await db.execute(
      "DELETE FROM todos WHERE id = ? AND shopkeeper_id = ?",
      [todoId, shopkeeperId]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Todo not found or unauthorized." });
    }
    res.json({ message: "Todo deleted successfully" });
  } catch (err) {
    console.error("Error deleting todo:", err);
    res.status(500).json({ error: "Database error while deleting todo." });
  }
});

module.exports = router;
