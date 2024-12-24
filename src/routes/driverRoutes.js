const express = require('express');
const {getDrivers, updateDriverLocation, updateDriver} = require('../controllers/driverController');

const router = express.Router();

router.put('/update-driver-location', updateDriverLocation);
router.get('/driver', getDrivers);
router.put('/update-driver', updateDriver);

module.exports = router;
