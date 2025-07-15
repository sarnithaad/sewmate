const express = require('express');
const router = express.Router();
const db = require("../db");
const authenticate = require("../middleware/auth");

// ✅ Create a new bill with optional design_url (now auto-generates bill_number)
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

    // Basic validation (bill_number is no longer required from frontend)
    if (!customer_name || !mobile || !dress_type || !order_date || !due_date || total_value === undefined) {
        return res.status(400).json({ error: "Missing required bill fields (customer name, mobile, dress type, dates, total value)." });
    }

    const conn = await db.getConnection();
    await conn.beginTransaction();

    try {
        // 1. Get the last bill_number for this shopkeeper, casting to unsigned integer for proper numerical MAX
        const [lastBill] = await conn.execute(
            `SELECT MAX(CAST(bill_number AS UNSIGNED)) AS max_bill_number FROM bills WHERE shopkeeper_id = ?`,
            [shopkeeperId]
        );

        let newBillNumber = 1;
        if (lastBill.length > 0 && lastBill[0].max_bill_number !== null) {
            newBillNumber = lastBill[0].max_bill_number + 1;
        }

        // 2. Insert the new bill with the generated bill_number
        const [billResult] = await conn.execute(
            `INSERT INTO bills
                (shopkeeper_id, bill_number, customer_name, mobile, dress_type, order_date, due_date, total_value, status, design_url)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'Booked', ?)`,
            [
                shopkeeperId,
                newBillNumber, // Use the auto-generated bill number
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
        // Return the generated bill_number to the frontend
        res.status(201).json({ message: "✅ Bill created", billId, bill_number: newBillNumber });
    } catch (err) {
        await conn.rollback();
        console.error("❌ Bill creation error:", err);
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

    // Calculate dates based on UTC midnight for consistency
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0); // Set to midnight UTC
    const todayStr = today.toISOString().split("T")[0]; // YYYY-MM-DD

    const next2 = new Date(today); // Start from today's UTC midnight
    next2.setUTCDate(today.getUTCDate() + 2); // Add 2 days in UTC
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
    const date = req.params.date; // This 'date' is now a YYYY-MM-DD UTC string from frontend

    try {
        const [bills] = await db.execute(
            // MODIFIED: Use DATE() function to compare only the date part
            `SELECT id, bill_number, customer_name, due_date, total_value, status
                FROM bills WHERE shopkeeper_id = ? AND DATE(due_date) = ?
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
    const shopkeeperId = req.shopkeeperId;

    // Add validation for status
    const validStatuses = ["Booked", "Cut", "Stitched", "Packed", "Delivered"];
    if (!validStatuses.includes(status)) {
        return res.status(400).json({ error: "Invalid status provided." });
    }

    let updateQuery = `UPDATE bills SET status = ?, status_date = ?`;
    const queryParams = [status, status_date];

    // If status is 'Delivered', also set the delivery_date to the current status_date
    if (status === 'Delivered') {
        updateQuery += `, delivery_date = ?`;
        queryParams.push(status_date);
    }

    updateQuery += ` WHERE id = ? AND shopkeeper_id = ?`;
    queryParams.push(bill_id, shopkeeperId);

    try {
        const [result] = await db.execute(updateQuery, queryParams);
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

    // Calculate today's date based on UTC midnight for consistency
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0); // Set to midnight UTC
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

// ✅ Get total revenue for a shopkeeper (new endpoint for Revenue.jsx)
// Allows filtering by start_date and end_date query parameters
router.get("/revenue", authenticate, async (req, res) => {
    const shopkeeperId = req.shopkeeperId;
    const { start_date, end_date } = req.query; // Get date range from query parameters

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
        const totalRevenue = result[0].total_revenue || 0; // Default to 0 if no revenue

        res.json({ total_revenue: totalRevenue });
    } catch (err) {
        console.error("❌ Revenue fetch error:", err);
        res.status(500).json({ error: "Failed to fetch revenue" });
    }
});

module.exports = router;
