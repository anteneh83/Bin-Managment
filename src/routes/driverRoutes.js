const express = require('express');
const {getDrivers, updateDriverLocation} = require('../controllers/driverController');

const router = express.Router();

router.put('/update-driver-location', updateDriverLocation);
router.get('/driver', getDrivers);

module.exports = router;
