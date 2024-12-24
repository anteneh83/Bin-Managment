const express = require('express');
const { updateDriverLocation, updateBinStatus, getBinStatus, modifyBinStatus } = require('../controllers/binController');
const router = express.Router();

router.post('/bin', updateBinStatus);
router.get('/bin', getBinStatus);
router.post('/update-bin', modifyBinStatus);

module.exports = router;
