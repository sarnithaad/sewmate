const express = require("express");
const router = express.Router();
const db = require("../db");
const authenticate = require("../middleware/auth");

// Utility: basic validation
const isEmpty = val => !val || val.trim() === "";

// ✅ Add a new design
router.post("/", authenticate, async (req, res) => {
  const shopkeeperId = req.shopkeeperId;
  const { name, description = "", image_url = "" } = req.body;

  if (isEmpty(name)) {
    return res.status(400).json({ error: "Design name is required" });
  }

  try {
    const [result] = await db.execute(
      "INSERT INTO designs (shopkeeper_id, name, description, image_url) VALUES (?, ?, ?, ?)",
      [shopkeeperId, name.trim(), description.trim(), image_url.trim()]
    );
    res.status(201).json({ message: "Design added", designId: result.insertId });
  } catch (err) {
    console.error("Error adding design:", err);
    res.status(500).json({ error: "Database error while adding design" });
  }
});

// ✅ Get all designs
router.get("/", authenticate, async (req, res) => {
  const shopkeeperId = req.shopkeeperId;
  try {
    const [designs] = await db.execute(
      "SELECT id, name, description, image_url, created_at FROM designs WHERE shopkeeper_id = ? ORDER BY created_at DESC",
      [shopkeeperId]
    );
    res.json(designs);
  } catch (err) {
    console.error("Error fetching designs:", err);
    res.status(500).json({ error: "Database error while fetching designs" });
  }
});

// ✅ Get a single design by ID
router.get("/:id", authenticate, async (req, res) => {
  const shopkeeperId = req.shopkeeperId;
  const designId = req.params.id;
  try {
    const [rows] = await db.execute(
      "SELECT id, name, description, image_url, created_at FROM designs WHERE id = ? AND shopkeeper_id = ?",
      [designId, shopkeeperId]
    );
    if (rows.length === 0) return res.status(404).json({ error: "Design not found" });
    res.json(rows[0]);
  } catch (err) {
    console.error("Error fetching design:", err);
    res.status(500).json({ error: "Database error while fetching design" });
  }
});

// ✅ Update a design
router.put("/:id", authenticate, async (req, res) => {
  const shopkeeperId = req.shopkeeperId;
  const designId = req.params.id;
  const { name, description = "", image_url = "" } = req.body;

  if (isEmpty(name)) {
    return res.status(400).json({ error: "Design name is required" });
  }

  try {
    const [result] = await db.execute(
      "UPDATE designs SET name = ?, description = ?, image_url = ? WHERE id = ? AND shopkeeper_id = ?",
      [name.trim(), description.trim(), image_url.trim(), designId, shopkeeperId]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Design not found or not yours" });
    }
    res.json({ message: "Design updated successfully" });
  } catch (err) {
    console.error("Error updating design:", err);
    res.status(500).json({ error: "Database error while updating design" });
  }
});

// ✅ Delete a design
router.delete("/:id", authenticate, async (req, res) => {
  const shopkeeperId = req.shopkeeperId;
  const designId = req.params.id;

  try {
    const [result] = await db.execute(
      "DELETE FROM designs WHERE id = ? AND shopkeeper_id = ?",
      [designId, shopkeeperId]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Design not found or not yours" });
    }
    res.json({ message: "Design deleted successfully" });
  } catch (err) {
    console.error("Error deleting design:", err);
    res.status(500).json({ error: "Database error while deleting design" });
  }
});

module.exports = router;
