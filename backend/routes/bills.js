const express = require('express');
const router = express.Router();
const db = require("../db");
const authenticate = require("../middleware/auth");

const isEmpty = val => !val || val.trim() === "";

// ✅ Revenue Summary (with optional date range)
router.get("/revenue", authenticate, async (req, res) => {
    const shopkeeperId = req.shopkeeperId;
    const { start_date, end_date } = req.query;

    let query = `
        SELECT SUM(total_value) AS total_revenue
        FROM bills
        WHERE shopkeeper_id = ? AND status = 'Delivered'
    `;
    const queryParams = [shopkeeperId];

    if (start_date) {
        query += ` AND delivery_date >= ?`;
        queryParams.push(start_date);
    }
    if (end_date) {
        query += ` AND delivery_date <= ?`;
        queryParams.push(end_date);
    }

    try {
        const [result] = await db.execute(query, queryParams);
        res.json({ total_revenue: result[0].total_revenue || 0 });
    } catch (err) {
        console.error("❌ Revenue fetch error:", err);
        res.status(500).json({ error: "Failed to fetch revenue" });
    }
});

// ✅ Monthly Revenue Summary (for charts)
router.get("/revenue/monthly", authenticate, async (req, res) => {
    const shopkeeperId = req.shopkeeperId;

    try {
        const [rows] = await db.execute(
            `SELECT DATE_FORMAT(delivery_date, '%Y-%m') AS month, SUM(total_value) AS total_revenue
             FROM bills
             WHERE shopkeeper_id = ? AND status = 'Delivered'
             GROUP BY month
             ORDER BY month DESC
             LIMIT 6`,
            [shopkeeperId]
        );
        res.json(rows);
    } catch (err) {
        console.error("❌ Monthly revenue fetch error:", err);
        res.status(500).json({ error: "Failed to fetch monthly revenue" });
    }
});

// ✅ Overdue tasks
router.get("/overdue", authenticate, async (req, res) => {
    const shopkeeperId = req.shopkeeperId;
   const now = new Date();
const istOffsetMs = 5.5 * 60 * 60 * 1000;
const istDate = new Date(now.getTime() + istOffsetMs);
istDate.setHours(0, 0, 0, 0);
const todayStr = istDate.toISOString().split("T")[0];


    try {
        const [rows] = await db.execute(
            `SELECT id, bill_number, customer_name, due_date, status, total_value
             FROM bills
             WHERE shopkeeper_id = ? AND status NOT IN ('Packed', 'Delivered') AND due_date < ?
             ORDER BY due_date ASC`,
            [shopkeeperId, todayStr]
        );
        res.json(rows);
    } catch (err) {
        console.error("❌ Overdue fetch error:", err);
        res.status(500).json({ error: "Error fetching overdue tasks" });
    }
});

// ✅ Dashboard delivery summary
// ✅ Dashboard delivery summary
router.get("/dashboard-deliveries", authenticate, async (req, res) => {
    const shopkeeperId = req.shopkeeperId;

    // Convert to IST (UTC+5:30) and remove time component
    const now = new Date();
    const istOffsetMs = 5.5 * 60 * 60 * 1000;
    const istDate = new Date(now.getTime() + istOffsetMs);
    istDate.setHours(0, 0, 0, 0);
    const todayStr = istDate.toISOString().split("T")[0];

    const next2 = new Date(istDate);
    next2.setDate(istDate.getDate() + 2);
    const next2Str = next2.toISOString().split("T")[0];

    try {
        const [overdue] = await db.execute(
            `SELECT id, bill_number, customer_name, due_date, total_value, status
             FROM bills
             WHERE shopkeeper_id = ? AND due_date < ? AND status NOT IN ('Delivered', 'Packed')`,
            [shopkeeperId, todayStr]
        );

        const [todayBills] = await db.execute(
            `SELECT id, bill_number, customer_name, due_date, total_value, status
             FROM bills
             WHERE shopkeeper_id = ? AND due_date = ? AND status NOT IN ('Delivered', 'Packed')`,
            [shopkeeperId, todayStr]
        );

        const [upcoming] = await db.execute(
            `SELECT id, bill_number, customer_name, due_date, total_value, status
             FROM bills
             WHERE shopkeeper_id = ? AND due_date > ? AND due_date <= ? AND status NOT IN ('Delivered', 'Packed')`,
            [shopkeeperId, todayStr, next2Str]
        );

        res.json({ overdue, today: todayBills, upcoming });
    } catch (err) {
        console.error("❌ Dashboard delivery fetch error:", err);
        res.status(500).json({ error: "Failed to load delivery dashboard" });
    }
});


// ✅ Bills by specific date
router.get("/by-date/:date", authenticate, async (req, res) => {
    const shopkeeperId = req.shopkeeperId;
    const date = req.params.date;

    try {
        const [bills] = await db.execute(
            `SELECT id, bill_number, customer_name, due_date, total_value, status
             FROM bills
             WHERE shopkeeper_id = ? AND DATE(due_date) = ?
             ORDER BY bill_number ASC`,
            [shopkeeperId, date]
        );
        res.json({ bills });
    } catch (err) {
        console.error("❌ Date-based fetch error:", err);
        res.status(500).json({ error: "Failed to load bills for date" });
    }
});

// ✅ Create new bill
router.post("/", authenticate, async (req, res) => {
    const shopkeeperId = req.shopkeeperId;
    const {
        customer_name,
        mobile,
        dress_type,
        order_date,
        due_date,
        measurements = {},
        extras = [],
        total_value,
        design_url = ""
    } = req.body;

    if (!customer_name || !mobile || !dress_type || !order_date || !due_date || total_value === undefined) {
        return res.status(400).json({ error: "Missing required bill fields." });
    }

    const conn = await db.getConnection();
    await conn.beginTransaction();

    try {
        const [lastBill] = await conn.execute(
            `SELECT MAX(CAST(bill_number AS UNSIGNED)) AS max_bill_number FROM bills WHERE shopkeeper_id = ?`,
            [shopkeeperId]
        );

        const newBillNumber = (lastBill[0].max_bill_number || 0) + 1;

        const [billResult] = await conn.execute(
            `INSERT INTO bills (shopkeeper_id, bill_number, customer_name, mobile, dress_type, order_date, due_date, total_value, status, design_url)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'Booked', ?)`,
            [shopkeeperId, newBillNumber, customer_name, mobile, dress_type, order_date, due_date, total_value, design_url]
        );

        const billId = billResult.insertId;

        await conn.execute(
            `INSERT INTO bill_details (bill_id, measurements_json, extras_json)
             VALUES (?, ?, ?)`,
            [billId, JSON.stringify(measurements), JSON.stringify(extras)]
        );

        await conn.commit();
        res.status(201).json({ message: "✅ Bill created", billId, bill_number: newBillNumber });
    } catch (err) {
        await conn.rollback();
        console.error("❌ Bill creation error:", err);
        res.status(500).json({ error: "Failed to create bill" });
    } finally {
        conn.release();
    }
});

// ✅ Get all bills
router.get("/", authenticate, async (req, res) => {
    const shopkeeperId = req.shopkeeperId;
    try {
        const [bills] = await db.execute(
            `SELECT b.*, d.measurements_json, d.extras_json
             FROM bills b
             LEFT JOIN bill_details d ON b.id = d.bill_id
             WHERE b.shopkeeper_id = ?
             ORDER BY b.order_date DESC`,
            [shopkeeperId]
        );
        res.json(bills);
    } catch (err) {
        console.error("❌ Fetch bills error:", err);
        res.status(500).json({ error: "Database error fetching bills" });
    }
});

// ✅ Get a single bill
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

// ✅ Update bill status
router.post("/status", authenticate, async (req, res) => {
    const { bill_id, status, status_date } = req.body;
    const shopkeeperId = req.shopkeeperId;

    const validStatuses = ["Booked", "Cut", "Stitched", "Packed", "Delivered"];
    if (!validStatuses.includes(status)) {
        return res.status(400).json({ error: "Invalid status provided." });
    }

    let query = `UPDATE bills SET status = ?, status_date = ?`;
    const params = [status, status_date];

    if (status === 'Delivered') {
        query += `, delivery_date = ?`;
        params.push(status_date);
    }

    query += ` WHERE id = ? AND shopkeeper_id = ?`;
    params.push(bill_id, shopkeeperId);

    try {
        const [result] = await db.execute(query, params);
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: "Bill not found or unauthorized" });
        }
        res.json({ message: "✅ Status updated" });
    } catch (err) {
        console.error("❌ Status update error:", err);
        res.status(500).json({ error: "Failed to update status" });
    }
});

// ✅ Delete only if Delivered
router.delete("/delivered/:id", authenticate, async (req, res) => {
    const shopkeeperId = req.shopkeeperId;
    const billId = req.params.id;

    try {
        const [check] = await db.execute(
            `SELECT status FROM bills WHERE id = ? AND shopkeeper_id = ?`,
            [billId, shopkeeperId]
        );

        if (!check.length) {
            return res.status(404).json({ error: "Bill not found" });
        }
        if (check[0].status !== "Delivered") {
            return res.status(400).json({ error: "Only delivered bills can be deleted." });
        }

        const conn = await db.getConnection();
        await conn.beginTransaction();

        await conn.execute(`DELETE FROM bill_details WHERE bill_id = ?`, [billId]);
        await conn.execute(`DELETE FROM bills WHERE id = ? AND shopkeeper_id = ?`, [billId, shopkeeperId]);

        await conn.commit();
        res.json({ message: "✅ Delivered bill deleted" });
    } catch (err) {
        console.error("❌ Bill delete error:", err);
        res.status(500).json({ error: "Failed to delete bill" });
    }
});

module.exports = router;
