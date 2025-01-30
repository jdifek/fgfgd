const express = require("express");
const Wallet = require("../models/Wallet");
const Transaction = require("../models/Transaction");

const router = express.Router();

router.post("/transfer", async (req, res) => {
  const { fromWallet, toWallet, amount } = req.body;

  const sender = await Wallet.findOne({ address: fromWallet });
  const receiver = await Wallet.findOne({ address: toWallet });

  if (!sender || !receiver) return res.status(404).json({ error: "Wallet not found" });
  if (sender.balance < amount) return res.status(400).json({ error: "Insufficient funds" });

  sender.balance -= amount;
  receiver.balance += amount;

  await sender.save();
  await receiver.save();

  const transaction = new Transaction({ fromWallet, toWallet, amount });
  await transaction.save();

  res.json(transaction);
});

module.exports = router;
