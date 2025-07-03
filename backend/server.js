// server.js
const express = require("express");
const cors = require("cors");

const shopkeepersRouter = require("./routes/shopkeepers");
const billsRouter = require("./routes/bills");

const app = express();

app.use(cors());
app.use(express.json());

// API routes
app.use("/api/shopkeepers", shopkeepersRouter);
app.use("/api/bills", billsRouter);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Backend server running on port ${PORT}`));
