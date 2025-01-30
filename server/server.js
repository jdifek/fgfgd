const express = require("express");
const cors = require("cors");
const connectDB = require("./db");

const app = express();
app.use(cors());
app.use(express.json());

connectDB();

app.use("/api", require("./routes/auth"));
app.use("/api", require("./routes/wallets"));
app.use("/api", require("./routes/transactions"));

app.listen(5000, () => console.log("🚀 Server running on port 5000"));
