const express = require('express');
const router = express.Router();
const db = require("../db");
const authenticate = require("../middleware/auth");

// ✅ Create a new bill with optional design_url
router.post("/", authenticate, async (req, res) => {
    const shopkeeperId = req.shopkeeperId;
    const {
        bill_number,
        customer_name,
        mobile,
        dress_type,
        order_date,
        due_date,
        measurements = {},
        extras = [],
        total_value,
        design_url = "" // 🔧 new
    } = req.body;

    // Basic validation
    if (!bill_number || !customer_name || !mobile || !dress_type || !order_date || !due_date || total_value === undefined) {
        return res.status(400).json({ error: "Missing required bill fields." });
    }

    const conn = await db.getConnection();
    await conn.beginTransaction();

    try {
        const [billResult] = await conn.execute(
            `INSERT INTO bills
               (shopkeeper_id, bill_number, customer_name, mobile, dress_type, order_date, due_date, total_value, status, design_url)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'Booked', ?)`,
            [
                shopkeeperId,
                bill_number,
                customer_name,
                mobile,
                dress_type,
                order_date,
                due_date,
                total_value,
                design_url
            ]
        );

        const billId = billResult.insertId;

        await conn.execute(
            `INSERT INTO bill_details (bill_id, measurements_json, extras_json) VALUES (?, ?, ?)`,
            [billId, JSON.stringify(measurements), JSON.stringify(extras)]
        );

        await conn.commit();
        res.status(201).json({ message: "✅ Bill created", billId });
    } catch (err) {
        await conn.rollback();
        console.error("❌ Bill creation error:", err);
        // More specific error for duplicate bill number if needed
        if (err.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ error: "Bill number already exists for this shopkeeper." });
        }
        res.status(500).json({ error: "Failed to create bill" });
    } finally {
        conn.release();
    }
});

// ✅ Get all bills for current shopkeeper
router.get("/", authenticate, async (req, res) => {
    const shopkeeperId = req.shopkeeperId;
    try {
        const [bills] = await db.execute(
            `SELECT b.*, d.measurements_json, d.extras_json
               FROM bills b
               LEFT JOIN bill_details d ON b.id = d.bill_id
               WHERE b.shopkeeper_id = ?
               ORDER BY b.order_date DESC`, // Order by date
            [shopkeeperId]
        );
        res.json(bills);
    } catch (err) {
        console.error("❌ Fetch bills error:", err);
        res.status(500).json({ error: "Database error fetching bills" });
    }
});

// ✅ Get a single bill by ID
router.get("/:id", authenticate, async (req, res) => {
    const shopkeeperId = req.shopkeeperId;
    const billId = req.params.id;

    try {
        const [bills] = await db.execute(
            `SELECT b.*, d.measurements_json, d.extras_json
               FROM bills b
               LEFT JOIN bill_details d ON b.id = d.bill_id
               WHERE b.id = ? AND b.shopkeeper_id = ?`,
            [billId, shopkeeperId]
        );

        if (bills.length === 0) {
            return res.status(404).json({ error: "Bill not found" });
        }

        res.json(bills[0]);
    } catch (err) {
        console.error("❌ Single bill fetch error:", err);
        res.status(500).json({ error: "Failed to fetch bill" });
    }
});

// ✅ Dashboard deliveries
router.get('/dashboard-deliveries', authenticate, async (req, res) => {
    const shopkeeperId = req.shopkeeperId;
    const today = new Date();
    const todayStr = today.toISOString().split("T")[0];
    const next2 = new Date();
    next2.setDate(today.getDate() + 2);
    const next2Str = next2.toISOString().split("T")[0];

    try {
        const [overdue] = await db.execute(
            `SELECT id, bill_number, customer_name, due_date, total_value, status
               FROM bills
               WHERE shopkeeper_id = ? AND due_date < ? AND status != 'Delivered' AND status != 'Packed'
               ORDER BY due_date ASC`, // Order overdue bills
            [shopkeeperId, todayStr]
        );
        const [todayBills] = await db.execute(
            `SELECT id, bill_number, customer_name, due_date, total_value, status
               FROM bills
               WHERE shopkeeper_id = ? AND due_date = ? AND status != 'Delivered' AND status != 'Packed'
               ORDER BY due_date ASC`, // Order today's bills
            [shopkeeperId, todayStr]
        );
        const [upcoming] = await db.execute(
            `SELECT id, bill_number, customer_name, due_date, total_value, status
               FROM bills
               WHERE shopkeeper_id = ? AND due_date > ? AND due_date <= ? AND status != 'Delivered' AND status != 'Packed'
               ORDER BY due_date ASC`, // Order upcoming bills
            [shopkeeperId, todayStr, next2Str]
        );
        res.json({ overdue, today: todayBills, upcoming });
    } catch (err) {
        console.error("❌ Dashboard delivery fetch error:", err);
        res.status(500).json({ error: "Failed to load delivery dashboard" });
    }
});

// ✅ Bills by due date
router.get("/by-date/:date", authenticate, async (req, res) => {
    const shopkeeperId = req.shopkeeperId;
    const date = req.params.date;

    try {
        const [bills] = await db.execute(
            `SELECT id, bill_number, customer_name, due_date, total_value, status
               FROM bills WHERE shopkeeper_id = ? AND due_date = ?
               ORDER BY bill_number ASC`, // Order for consistency
            [shopkeeperId, date]
        );
        res.json({ bills }); // Return as { bills: [...] }
    } catch (err) {
        console.error("❌ Date-based fetch error:", err);
        res.status(500).json({ error: "Failed to load bills for date" });
    }
});

// ✅ Update bill status
router.post("/status", authenticate, async (req, res) => {
    const { bill_id, status, status_date } = req.body;
    // Add validation for status
    const validStatuses = ["Booked", "Cut", "Stitched", "Packed", "Delivered"];
    if (!validStatuses.includes(status)) {
        return res.status(400).json({ error: "Invalid status provided." });
    }

    try {
        const [result] = await db.execute(
            `UPDATE bills SET status = ?, status_date = ? WHERE id = ? AND shopkeeper_id = ?`, // Add shopkeeper_id for security
            [status, status_date, bill_id, req.shopkeeperId]
        );
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: "Bill not found or unauthorized to update." });
        }
        res.json({ message: "✅ Status updated" });
    } catch (err) {
        console.error("❌ Status update error:", err);
        res.status(500).json({ error: "Failed to update bill status" });
    }
});

// ✅ Delete delivered bill (This route is not used by frontend but kept for completeness)
router.delete("/delivered/:id", authenticate, async (req, res) => {
    const billId = req.params.id;
    const shopkeeperId = req.shopkeeperId; // Ensure only owner can delete
    try {
        // First, check if the bill exists and belongs to the shopkeeper and is delivered
        const [billCheck] = await db.execute(
            `SELECT status FROM bills WHERE id = ? AND shopkeeper_id = ?`,
            [billId, shopkeeperId]
        );

        if (billCheck.length === 0) {
            return res.status(404).json({ error: "Bill not found or unauthorized." });
        }
        if (billCheck[0].status !== 'Delivered') {
            return res.status(400).json({ error: "Only 'Delivered' bills can be deleted via this route." });
        }

        // Use transaction for deletion
        const conn = await db.getConnection();
        await conn.beginTransaction();
        try {
            await conn.execute(`DELETE FROM bill_details WHERE bill_id = ?`, [billId]);
            const [result] = await conn.execute(`DELETE FROM bills WHERE id = ? AND shopkeeper_id = ?`, [billId, shopkeeperId]);

            if (result.affectedRows === 0) {
                await conn.rollback();
                return res.status(404).json({ error: "Bill not found or unauthorized to delete." });
            }
            await conn.commit();
            res.json({ message: "✅ Delivered bill deleted" });
        } catch (txErr) {
            await conn.rollback();
            throw txErr;
        } finally {
            conn.release();
        }
    } catch (err) {
        console.error("❌ Deletion error:", err);
        res.status(500).json({ error: "Failed to delete delivered bill" });
    }
});

// ✅ Overdue tasks (This route is used by OverdueTask.jsx)
router.get("/overdue", authenticate, async (req, res) => {
    const shopkeeperId = req.shopkeeperId;
    const today = new Date();
    const todayStr = today.toISOString().split("T")[0]; // YYYY-MM-DD

    try {
        const [rows] = await db.execute(
            `SELECT id, bill_number, customer_name, due_date, status, total_value
               FROM bills
               WHERE shopkeeper_id = ?
                 AND status NOT IN ('Packed', 'Delivered')
                 AND due_date < ?
               ORDER BY due_date ASC`, // Order by due date
            [shopkeeperId, todayStr]
        );
        res.json(rows);
    } catch (err) {
        console.error("❌ Overdue fetch error:", err);
        res.status(500).json({ error: "Error fetching overdue tasks" });
    }
});

module.exports = router;
