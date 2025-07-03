const express = require("express");
const multer = require("multer");
const db = require("../db");
const router = express.Router();

const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function(req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});
const upload = multer({ storage: storage });

router.post("/upload", upload.single('image'), async (req, res) => {
  const { shopkeeper_id, dress_type, part } = req.body;
  const image_url = `/uploads/${req.file.filename}`;
  try {
    await db.execute(
      "INSERT INTO designs (shopkeeper_id, dress_type, part, image_url) VALUES (?, ?, ?, ?)",
      [shopkeeper_id, dress_type, part, image_url]
    );
    res.json({ message: "Image uploaded", image_url });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.get("/:shopkeeper_id/:dress_type/:part", async (req, res) => {
  const { shopkeeper_id, dress_type, part } = req.params;
  try {
    const [rows] = await db.execute(
      "SELECT * FROM designs WHERE shopkeeper_id = ? AND dress_type = ? AND part = ?",
      [shopkeeper_id, dress_type, part]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
