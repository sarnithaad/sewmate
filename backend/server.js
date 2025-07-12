    const express = require("express");
    const cors = require("cors"); // Import the cors package
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

    // *** CRITICAL: Allow all origins for debugging persistent CORS issues ***
    // This is the most permissive CORS setting. If issues persist, it's likely
    // a backend connectivity problem, not a CORS policy blocking.
    // WARNING: This is NOT recommended for production environments due to security risks.
    // For production, you should revert to a more restrictive configuration.
    app.use(cors());

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
    
