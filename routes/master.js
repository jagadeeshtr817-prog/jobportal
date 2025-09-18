const express = require('express');
const router = express.Router();
const path = require('path');
const { authenticateMaster } = require('../middleware/auth');

// Serve master login page
router.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../master-login.html'));
});

// Serve master dashboard
router.get('/dashboard', (req, res) => {
    res.sendFile(path.join(__dirname, '../master-dashboard.html'));
});

module.exports = router;