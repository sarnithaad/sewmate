const express = require("express");
const cors = require("cors");
const shopkeepersRouter = require("./routes/shopkeepers");
const customersRouter = require("./routes/customers");
const billsRouter = require("./routes/bills");
const todosRouter = require("./routes/todos");
const designsRouter = require("./routes/designs");

const app = express();

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

app.use("/api/shopkeepers", shopkeepersRouter);
app.use("/api/customers", customersRouter);
app.use("/api/bills", billsRouter);
app.use("/api/todos", todosRouter);
app.use("/api/designs", designsRouter);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Backend server running on port ${PORT}`));
