const express = require("express");
const router = express.Router();
const db = require("../db");
const authenticate = require("../middleware/auth");

// Utility validation
const isEmpty = val => !val || val.trim() === "";

// ✅ Add a new todo/task
// ✅ Full update of a todo (task, due_date, status)
router.put("/:id", authenticate, async (req, res) => {
    const shopkeeperId = req.shopkeeperId;
    const todoId = req.params.id;
    const { task, due_date, status } = req.body;

    if (!task || !due_date || !status) {
        return res.status(400).json({ error: "Task, due date, and status are required." });
    }

    const validStatuses = ["pending", "completed"];
    if (!validStatuses.includes(status.toLowerCase())) {
        return res.status(400).json({ error: "Invalid status. Must be 'pending' or 'completed'." });
    }

    try {
        const [result] = await db.execute(
            `UPDATE todos SET task = ?, due_date = ?, status = ?
             WHERE id = ? AND shopkeeper_id = ?`,
            [task.trim(), due_date, status.trim().toLowerCase(), todoId, shopkeeperId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: "Todo not found or unauthorized." });
        }

        res.json({ message: "✅ Todo updated successfully" });
    } catch (err) {
        console.error("❌ Error updating todo:", err);
        res.status(500).json({ error: "Database error while updating todo." });
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
        console.error("❌ Error fetching todos:", err);
        res.status(500).json({ error: "Database error while fetching todos." });
    }
});

// ✅ Get a single todo by ID (Fixes GET /api/todos/:id)
router.get("/:id", authenticate, async (req, res) => {
    const shopkeeperId = req.shopkeeperId;
    const todoId = req.params.id;

    try {
        const [todos] = await db.execute(
            `SELECT id, task, due_date, status, created_at
               FROM todos
               WHERE id = ? AND shopkeeper_id = ?`,
            [todoId, shopkeeperId]
        );
        if (todos.length === 0) {
            return res.status(404).json({ error: "Todo not found or unauthorized." });
        }
        res.json(todos[0]);
    } catch (err) {
        console.error("❌ Error fetching single todo:", err);
        res.status(500).json({ error: "Database error while fetching todo." });
    }
});

// ✅ Update todo status (Using PATCH for partial update)
router.patch("/:id/status", authenticate, async (req, res) => {
    const shopkeeperId = req.shopkeeperId;
    const todoId = req.params.id;
    const { status } = req.body;

    if (!status) return res.status(400).json({ error: "Status is required." });
    const validStatuses = ["pending", "completed"]; // Define valid statuses
    if (!validStatuses.includes(status.toLowerCase())) {
        return res.status(400).json({ error: "Invalid status provided. Must be 'pending' or 'completed'." });
    }

    try {
        const [result] = await db.execute(
            `UPDATE todos SET status = ? WHERE id = ? AND shopkeeper_id = ?`,
            [status.trim().toLowerCase(), todoId, shopkeeperId]
        );
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: "Todo not found or unauthorized." });
        }
        res.json({ message: "✅ Status updated successfully" });
    } catch (err) {
        console.error("❌ Error updating status:", err);
        res.status(500).json({ error: "Database error while updating status." });
    }
});

// ✅ Delete todo
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
        res.json({ message: "✅ Todo deleted successfully" });
    } catch (err) {
        console.error("❌ Error deleting todo:", err);
        res.status(500).json({ error: "Database error while deleting todo." });
    }
});

module.exports = router;
