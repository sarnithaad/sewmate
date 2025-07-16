const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Ensure upload directory exists
const uploadDir = path.join(__dirname, "../uploads/designs");
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer setup
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.random().toString(36).substring(2, 10);
        const ext = path.extname(file.originalname);
        cb(null, uniqueSuffix + ext);
    }
});

const upload = multer({ storage });

// In-memory array for demo
let designs = [];

// POST: upload image
router.post("/upload", upload.single("image"), (req, res) => {
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });

    const imageUrl = `/uploads/designs/${req.file.filename}`;
    res.status(200).json({ image_url: imageUrl });
});

// POST: save metadata
router.post("/", (req, res) => {
    const { name, description, image_url, dress_type, part } = req.body;

    if (!image_url || !name) {
        return res.status(400).json({ error: "Missing design details." });
    }

    const newDesign = {
        id: Date.now(),
        name,
        description,
        image_url,
        dress_type,
        part,
    };

    designs.push(newDesign);
    res.status(201).json({ message: "Design saved successfully", design: newDesign });
});

// GET: fetch by dress_type and part
router.get("/", (req, res) => {
    const { dress_type, part } = req.query;

    let filtered = designs;

    if (dress_type) {
        filtered = filtered.filter(d => d.dress_type === dress_type);
    }

    if (part) {
        filtered = filtered.filter(d => d.part === part);
    }

    res.status(200).json(filtered);
});

module.exports = router;
