const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const morgan = require("morgan");
const path = require("path");

dotenv.config();

const app = express();

// ✅ Routers
const shopkeepersRouter = require("./routes/shopkeepers");
const billsRouter = require("./routes/bills");
const designsRouter = require("./routes/designs");
const customersRouter = require("./routes/customers");
const todosRouter = require("./routes/todos");

// ✅ Allowed origins (Frontend URLs)
const allowedOrigins = [
    "https://sewmate.vercel.app", // Production
    "https://sewmate-5ktmc0ujt-sarnitha-a-ds-projects.vercel.app", // Old Preview
    "http://localhost:3000", // Local Dev
    "https://sewmate-jo3kh43oj-sarnitha-a-ds-projects.vercel.app/",
    "https://sewmate-1h1ag142h-sarnitha-a-ds-projects.vercel.app" // New Preview
];

// ✅ CORS Middleware
app.use(cors({
    origin: function (origin, callback) {
        if (!origin) return callback(null, true); // Allow server-to-server or mobile clients
        if (allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error(`Not allowed by CORS: ${origin}`));
        }
    },
    credentials: true // Enable cookies/auth headers if needed
}));

// ✅ Handle preflight requests (OPTIONS)
app.options('*', cors());

// ✅ Body parser & logger
app.use(express.json());
app.use(morgan("dev"));

// ✅ Serve static files (like images)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ✅ API Routes
app.get("/", (req, res) => {
    res.send("🧵 SewMate API is running 🚀");
});

app.use('/api/shopkeepers', shopkeepersRouter);
app.use('/api/bills', billsRouter);
app.use('/api/designs', designsRouter);
app.use('/api/customers', customersRouter);
app.use('/api/todos', todosRouter);

// ✅ 404 handler
app.use((req, res) => {
    res.status(404).json({ error: "API route not found" });
});

// ✅ Global Error Handler (incl. CORS)
app.use((err, req, res, next) => {
    console.error("❌ Server error:", err);
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
