const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const morgan = require("morgan");
const path = require("path"); // Import path module

dotenv.config();

const app = express(); // Define app here

const shopkeepersRouter = require("./routes/shopkeepers");
const billsRouter = require("./routes/bills");
const designsRouter = require("./routes/designs");
const customersRouter = require("./routes/customers");
const todosRouter = require("./routes/todos");

const allowedOrigins = [
    "https://sewmate.vercel.app", // production
    "https://sewmate-5ktmc0ujt-sarnitha-a-ds-projects.vercel.app", // Vercel preview
    "http://localhost:3000" // development
];

app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);
        if (allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error(`Not allowed by CORS: ${origin}`));
        }
    },
    credentials: true
}));
app.use(express.json());
app.use(morgan("dev")); // For logging requests

// Serve static files from the 'uploads' directory
// This makes images accessible via URLs like http://localhost:10000/uploads/designs/image.jpg
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));


// Routes
app.get("/", (req, res) => {
    res.send("🧵 SewMate API is running 🚀");
});

app.use('/api/shopkeepers', shopkeepersRouter);
app.use('/api/bills', billsRouter);
app.use('/api/designs', designsRouter);
app.use('/api/customers', customersRouter);
app.use('/api/todos', todosRouter);

// 404 handler (keep only one, after all routes)
app.use((req, res) => {
    res.status(404).json({ error: "API route not found" });
});

// Global error handler
app.use((err, req, res, next) => {
    console.error("❌ Server error:", err);
    // Check if it's a CORS error specifically
    if (err.message.includes("Not allowed by CORS")) {
        return res.status(403).json({ error: "CORS policy violation: " + err.message });
    }
    res.status(500).json({ error: "Internal Server Error" });
});

// Start server
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
    console.log(`✅ Backend server running on http://localhost:${PORT}`);
});
