const express = require("express");
const cors = require("cors");
const path = require("path");

const shopkeepersRouter = require("./routes/shopkeepers");
const billsRouter = require("./routes/bills");
// Add other routers as needed

const app = express();

app.use(cors());
app.use(express.json());

// API routes
app.use("/api/shopkeepers", shopkeepersRouter);
app.use("/api/bills", billsRouter);
// Add other routers here

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Backend server running on port ${PORT}`));
