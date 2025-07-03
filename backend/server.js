// server.js
const express = require("express");
const cors = require("cors");

const shopkeepersRouter = require("./routes/shopkeepers");
const billsRouter = require("./routes/bills");
const designsRouter = require("./routes/designs");

const app = express();

app.use(cors());
app.use(express.json());

// API routes
app.use("/api/shopkeepers", shopkeepersRouter);
app.use("/api/bills", billsRouter);
app.use("/api/designs", designsRouter);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Backend server running on port ${PORT}`));
