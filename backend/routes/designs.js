const express = require("express");
const router = express.Router();
const db = require("../db");
const authenticate = require("../middleware/auth");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

// ⚙️ Multer setup for image uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadPath = path.join(__dirname, "..", "uploads", "designs");
        fs.mkdirSync(uploadPath, { recursive: true }); // ensure directory exists
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        // Use a more robust unique name to prevent collisions
        const ext = path.extname(file.originalname);
        const uniqueName = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}${ext}`;
        cb(null, uniqueName);
    }
});
const upload = multer({ storage });

// Helper to validate empty strings
const isEmpty = val => !val || val.trim() === "";

// ✅ [POST] Upload a design image
router.post("/upload", authenticate, upload.single("image"), async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: "No image file uploaded." });
    }

    // The image_url is the path from the root of the server's static files
    const imageUrl = `/uploads/designs/${req.file.filename}`;
    res.status(200).json({ message: "Image uploaded successfully", image_url: imageUrl });
});

// ✅ [POST] Add a new design (now includes dress_type and part)
router.post("/", authenticate, async (req, res) => {
    const shopkeeperId = req.shopkeeperId;
    const { name, description = "", image_url = "", dress_type, part } = req.body; // Added dress_type, part

    if (isEmpty(name) || isEmpty(image_url) || isEmpty(dress_type) || isEmpty(part)) {
        return res.status(400).json({ error: "Design name, image URL, dress type, and part are required." });
    }

    try {
        const [result] = await db.execute(
            "INSERT INTO designs (shopkeeper_id, name, description, image_url, dress_type, part) VALUES (?, ?, ?, ?, ?, ?)",
            [shopkeeperId, name.trim(), description.trim(), image_url.trim(), dress_type.trim(), part.trim()]
        );
        res.status(201).json({ message: "✅ Design added", designId: result.insertId });
    } catch (err) {
        console.error("❌ Error adding design:", err);
        res.status(500).json({ error: "Database error while adding design" });
    }
});

// ✅ Get all designs (now with optional filtering by dress_type and part)
router.get("/", authenticate, async (req, res) => {
    const shopkeeperId = req.shopkeeperId;
    const { dress_type, part } = req.query; // Get query parameters

    let query = `SELECT id, name, description, image_url, dress_type, part, created_at
                   FROM designs
                   WHERE shopkeeper_id = ?`;
    const queryParams = [shopkeeperId];

    if (dress_type && dress_type !== 'All') { // 'All' is a common frontend filter value
        query += ` AND dress_type = ?`;
        queryParams.push(dress_type);
    }
    if (part && part !== 'All') { // 'All' is a common frontend filter value
        query += ` AND part = ?`;
        queryParams.push(part);
    }

    query += ` ORDER BY created_at DESC`;

    try {
        const [designs] = await db.execute(query, queryParams);
        res.json(designs);
    } catch (err) {
        console.error("❌ Error fetching designs:", err);
        res.status(500).json({ error: "Database error while fetching designs" });
    }
});

// ✅ [GET] Get a single design by ID
router.get("/:id", authenticate, async (req, res) => {
    const shopkeeperId = req.shopkeeperId;
    const designId = req.params.id;

    try {
        const [rows] = await db.execute(
            `SELECT id, name, description, image_url, dress_type, part, created_at
               FROM designs
               WHERE id = ? AND shopkeeper_id = ?`,
            [designId, shopkeeperId]
        );
        if (rows.length === 0) {
            return res.status(404).json({ error: "Design not found" });
        }
        res.json(rows[0]);
    } catch (err) {
        console.error("❌ Error fetching design:", err);
        res.status(500).json({ error: "Database error while fetching design" });
    }
});

// ✅ [PUT] Update a design
router.put("/:id", authenticate, async (req, res) => {
    const shopkeeperId = req.shopkeeperId;
    const designId = req.params.id;
    const { name, description = "", image_url = "", dress_type, part } = req.body; // Added dress_type, part

    if (isEmpty(name) || isEmpty(image_url) || isEmpty(dress_type) || isEmpty(part)) {
        return res.status(400).json({ error: "Design name, image URL, dress type, and part are required for update." });
    }

    try {
        const [result] = await db.execute(
            `UPDATE designs
               SET name = ?, description = ?, image_url = ?, dress_type = ?, part = ?
               WHERE id = ? AND shopkeeper_id = ?`,
            [name.trim(), description.trim(), image_url.trim(), dress_type.trim(), part.trim(), designId, shopkeeperId]
        );
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: "Design not found or not yours" });
        }
        res.json({ message: "✅ Design updated successfully" });
    } catch (err) {
        console.error("❌ Error updating design:", err);
        res.status(500).json({ error: "Database error while updating design" });
    }
});

// ✅ [DELETE] Delete a design
router.delete("/:id", authenticate, async (req, res) => {
    const shopkeeperId = req.shopkeeperId;
    const designId = req.params.id;

    try {
        const [result] = await db.execute(
            `DELETE FROM designs WHERE id = ? AND shopkeeper_id = ?`,
            [designId, shopkeeperId]
        );
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: "Design not found or not yours" });
        }
        res.json({ message: "✅ Design deleted successfully" });
    } catch (err) {
        console.error("❌ Error deleting design:", err);
        res.status(500).json({ error: "Database error while deleting design" });
    }
});

module.exports = router;
