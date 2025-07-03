const express = require("express");
const router = express.Router();
const authenticate = require("../middleware/auth");

// Replace with your actual DB logic
const db = require("../db");

// Create a new bill
router.post("/", authenticate, async (req, res) => {
  const shopkeeperId = req.shopkeeperId;
  const bill = { ...req.body, shopkeeper_id: shopkeeperId };
  const result = await db.bills.insertOne(bill);
  res.json({ message: "Bill created", billId: result.insertedId });
});

// Get all bills for the logged-in shopkeeper
router.get("/", authenticate, async (req, res) => {
  const shopkeeperId = req.shopkeeperId;
  const bills = await db.bills.find({ shopkeeper_id: shopkeeperId }).toArray();
  res.json(bills);
});

// Dashboard deliveries: overdue, today, next 2 days
router.get("/dashboard-deliveries", authenticate, async (req, res) => {
  const shopkeeperId = req.shopkeeperId;
  const today = new Date();
  today.setHours(0,0,0,0);
  const todayStr = today.toISOString().slice(0,10);

  const next2 = new Date(today);
  next2.setDate(today.getDate() + 2);
  const next2Str = next2.toISOString().slice(0,10);

  // Adjust queries for your DB
  const overdue = await db.bills.find({
    shopkeeper_id: shopkeeperId,
    due_date: { $lt: todayStr }
  }).toArray();

  const todayDeliveries = await db.bills.find({
    shopkeeper_id: shopkeeperId,
    due_date: todayStr
  }).toArray();

  const upcoming = await db.bills.find({
    shopkeeper_id: shopkeeperId,
    due_date: { $gt: todayStr, $lte: next2Str }
  }).toArray();

  res.json({ overdue, today: todayDeliveries, upcoming });
});

module.exports = router;
