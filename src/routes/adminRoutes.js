const express = require('express');
const { registerDriver } = require('../controllers/driverController');
const { registerBin } = require('../controllers/binController');
const router = express.Router();

router.post('/admin/register-driver', registerDriver);
router.post('/admin/register-bin', registerBin);

module.exports = router;
