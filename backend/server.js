const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const morgan = require("morgan");

dotenv.config(); // Load environment variables from .env

const shopkeepersRouter = require("./routes/shopkeepers");
const billsRouter = require("./routes/bills");
const designsRouter = require("./routes/designs");
const customersRouter = require("./routes/customers");
const todosRouter = require("./routes/todos");

const app = express();

// Middleware
app.use(cors({
  origin: 'https://sewmate.vercel.app', // allow your frontend domain
  credentials: true // if you use cookies or authentication
}));
app.use(express.json());
app.use(morgan("dev")); // For logging requests

// Routes
app.get("/", (req, res) => {
  res.send("🧵 SewMate API is running 🚀");
});

app.use("/api/shopkeepers", shopkeepersRouter);
app.use("/api/bills", billsRouter);
app.use("/api/designs", designsRouter);
app.use("/api/customers", customersRouter);
app.use("/api/todos", todosRouter);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: "API route not found" });
});

// Global error handler (optional)
app.use((err, req, res, next) => {
  console.error("❌ Server error:", err);
  res.status(500).json({ error: "Internal Server Error" });
});
// Place this LAST in server.js
app.use((req, res) => {
  res.status(404).send("Sorry, can't find that!");
});

// Start server
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`✅ Backend server running on http://localhost:${PORT}`);
});
