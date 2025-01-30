const express = require('express');
const Wallet = require('../models/Wallet');
const User = require('../models/User');
const { v4: uuidv4 } = require('uuid');

const router = express.Router();

router.post('/wallet', async (req, res) => {
  const { sessionID } = req.body;
  const user = await User.findOne({ sessionId: sessionID });

  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  const wallet = new Wallet({ address: uuidv4(), owner: user._id });
  await wallet.save();

  user.wallets.push(wallet._id);
  await user.save();

  res.json(wallet);
});

router.get('/wallet/:sessionID', async (req, res) => {  // Исправлено
  const sessionID = req.params.sessionID;
  const user = await User.findOne({ sessionId: sessionID }).populate('wallets');
  if (!user) return res.status(404).json({ error: "User not found" });
  res.json(user.wallets);
});

module.exports = router;
