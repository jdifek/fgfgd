const mongoose = require("mongoose");

const walletSchema = new mongoose.Schema({
  address: { type: String, unique: true, required: true },
  balance: { type: Number, default: 1000 },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
});

module.exports = mongoose.model("Wallet", walletSchema);
