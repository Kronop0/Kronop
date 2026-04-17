const express = require('express');
const router = express.Router();
const { mongoose } = require('../config/db');

// Storage routes placeholder
router.get('/', async (req, res) => {
  res.json({ success: true, message: 'Storage API endpoint', data: [] });
});

router.get('/status', async (req, res) => {
  res.json({ success: true, status: 'active', timestamp: new Date().toISOString() });
});

module.exports = router;
