const express = require('express')
const User = require('../models/User')
const { v4: uuidv4 } = require('uuid')

const router = express.Router();

router.post('/session', async (req, res) => {
  const sessionID = uuidv4();
  const user = new User({ sessionId: sessionID });
  await user.save();
  res.json({ sessionID })
})

module.exports = router;
