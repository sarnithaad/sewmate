// routes/designs.js
const express = require("express");
const router = express.Router();
const db = require("../db");
const authenticate = require("../middleware/auth");

// Add a new design
router.post("/", authenticate, async (req, res) => {
  const shopkeeperId = req.shopkeeperId;
  const { name, description, image_url } = req.body;
  try {
    const [result] = await db.execute(
      "INSERT INTO designs (shopkeeper_id, name, description, image_url) VALUES (?, ?, ?, ?)",
      [shopkeeperId, name, description, image_url]
    );
    res.json({ message: "Design added", designId: result.insertId });
  } catch (err) {
    res.status(500).json({ error: "Database error" });
  }
});

// Get all designs for the logged-in shopkeeper
router.get("/", authenticate, async (req, res) => {
  const shopkeeperId = req.shopkeeperId;
  try {
    const [designs] = await db.execute(
      "SELECT * FROM designs WHERE shopkeeper_id = ? ORDER BY created_at DESC",
      [shopkeeperId]
    );
    res.json(designs);
  } catch (err) {
    res.status(500).json({ error: "Database error" });
  }
});

// Get a single design by ID
router.get("/:id", authenticate, async (req, res) => {
  const shopkeeperId = req.shopkeeperId;
  const designId = req.params.id;
  try {
    const [rows] = await db.execute(
      "SELECT * FROM designs WHERE id = ? AND shopkeeper_id = ?",
      [designId, shopkeeperId]
    );
    if (rows.length === 0) return res.status(404).json({ error: "Design not found" });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: "Database error" });
  }
});

// Update a design
router.put("/:id", authenticate, async (req, res) => {
  const shopkeeperId = req.shopkeeperId;
  const designId = req.params.id;
  const { name, description, image_url } = req.body;
  try {
    const [result] = await db.execute(
      "UPDATE designs SET name = ?, description = ?, image_url = ? WHERE id = ? AND shopkeeper_id = ?",
      [name, description, image_url, designId, shopkeeperId]
    );
    if (result.affectedRows === 0) return res.status(404).json({ error: "Design not found or not yours" });
    res.json({ message: "Design updated" });
  } catch (err) {
    res.status(500).json({ error: "Database error" });
  }
});

// Delete a design
router.delete("/:id", authenticate, async (req, res) => {
  const shopkeeperId = req.shopkeeperId;
  const designId = req.params.id;
  try {
    const [result] = await db.execute(
      "DELETE FROM designs WHERE id = ? AND shopkeeper_id = ?",
      [designId, shopkeeperId]
    );
    if (result.affectedRows === 0) return res.status(404).json({ error: "Design not found or not yours" });
    res.json({ message: "Design deleted" });
  } catch (err) {
    res.status(500).json({ error: "Database error" });
  }
});

module.exports = router;
