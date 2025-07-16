const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const morgan = require("morgan");
const path = require("path");
const fs = require("fs");

dotenv.config();

const app = express();

// ✅ Routes
const shopkeepersRouter = require("./routes/shopkeepers");
const billsRouter = require("./routes/bills");
const designsRouter = require("./routes/designs");
const customersRouter = require("./routes/customers");
const todosRouter = require("./routes/todos");

// ✅ Ensure uploads directory exists on boot
const uploadDirs = ["uploads", "uploads/designs"];
uploadDirs.forEach(dir => {
    const fullPath = path.join(__dirname, dir);
    if (!fs.existsSync(fullPath)) {
        fs.mkdirSync(fullPath, { recursive: true });
        console.log(`📂 Created directory: ${fullPath}`);
    }
});

// ✅ CORS - for Vercel frontend
app.use(cors({
    origin: ["https://sewmate.vercel.app", "http://localhost:3000"], // include localhost for dev
    credentials: true
}));

app.use(express.json());
app.use(morgan("dev"));

// ✅ Static file hosting
app.use("/uploads", express.static(path.join(__dirname, "uploads"))); // e.g. /uploads/designs/img.jpg

// ✅ Base Route
app.get("/", (req, res) => {
    res.send("🧵 SewMate API is running 🚀");
});

// ✅ API Routes
app.use("/api/shopkeepers", shopkeepersRouter);
app.use("/api/bills", billsRouter);
app.use("/api/designs", designsRouter);
app.use("/api/customers", customersRouter);
app.use("/api/todos", todosRouter);

// ✅ 404 Not Found
app.use((req, res) => {
    res.status(404).json({ error: "API route not found" });
});

// ✅ Error Handler
app.use((err, req, res, next) => {
    console.error("❌ Server error:", err.stack);
    if (err.message.includes("Not allowed by CORS")) {
        return res.status(403).json({ error: "CORS policy violation: " + err.message });
    }
    res.status(500).json({ error: "Internal Server Error" });
});

// ✅ Start Server
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
    console.log(`✅ Backend server running on http://localhost:${PORT}`);
});
