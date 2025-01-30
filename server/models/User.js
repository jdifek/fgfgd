const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  sessionId: { type: String, unique: true, required: true },
  wallets: [{ type: mongoose.Schema.Types.ObjectId, ref: "Wallet" }],
});

module.exports = mongoose.model("User", userSchema);
