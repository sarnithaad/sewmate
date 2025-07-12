const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const router = express.Router();
const db = require("../db");

const JWT_SECRET = process.env.JWT_SECRET || "Sharnitha@2003";

// Helper to validate email
const isValidEmail = email => /\S+@\S+\.\S+/.test(email);

// ✅ Registration Route
router.post("/register", async (req, res) => {
    const {
        shop_name,
        owner_name,
        email,
        password,
        mobile,
        address = ""
    } = req.body;

    // Input validation
    if (!shop_name || !owner_name || !email || !password || !mobile) {
        return res.status(400).json({ error: "All fields except address are required." });
    }
    if (!isValidEmail(email)) {
        return res.status(400).json({ error: "Invalid email format." });
    }

    try {
        // Check for existing email
        const [existing] = await db.execute(
            "SELECT id FROM shopkeepers WHERE email = ?",
            [email.trim()]
        );
        if (existing.length > 0) {
            return res.status(409).json({ error: "Email is already registered." });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        await db.execute(
            `INSERT INTO shopkeepers
               (shop_name, owner_name, email, password, mobile, address)
               VALUES (?, ?, ?, ?, ?, ?)`,
            [shop_name.trim(), owner_name.trim(), email.trim(), hashedPassword, mobile.trim(), address.trim()]
        );

        res.status(201).json({ message: "Registration successful!" });
    } catch (err) {
        console.error("Registration error:", err);
        res.status(500).json({ error: "Database error during registration." });
    }
});

// ✅ Login Route
router.post("/login", async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: "Email and password are required." });
    }

    try {
        const [rows] = await db.execute("SELECT * FROM shopkeepers WHERE email = ?", [email.trim()]);
        if (rows.length === 0) {
            return res.status(401).json({ error: "Invalid email or password." });
        }

        const shopkeeper = rows[0];
        const passwordMatch = await bcrypt.compare(password, shopkeeper.password);

        if (!passwordMatch) {
            return res.status(401).json({ error: "Invalid email or password." });
        }

        const token = jwt.sign(
            { id: shopkeeper.id, email: shopkeeper.email },
            JWT_SECRET,
            { expiresIn: "7d" }
        );

        res.json({
            token,
            shopkeeper: {
                id: shopkeeper.id,
                shop_name: shopkeeper.shop_name,
                owner_name: shopkeeper.owner_name,
                email: shopkeeper.email,
                mobile: shopkeeper.mobile,
                address: shopkeeper.address
            }
        });
    } catch (err) {
        console.error("Login error:", err);
        res.status(500).json({ error: "Database error during login." });
    }
});

module.exports = router;
