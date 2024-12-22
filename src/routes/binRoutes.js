const express = require('express');
const { updateDriverLocation, updateBinStatus, getBinStatus } = require('../controllers/binController');
const router = express.Router();

router.put('/update-driver-location', updateDriverLocation);
router.post('/bin', updateBinStatus);
router.get('/bin', getBinStatus);

module.exports = router;
