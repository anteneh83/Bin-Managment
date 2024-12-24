const Driver = require('../models/Driver');
const Record = require('../models/Record');
const Bin = require('../models/Bin');

exports.getDrivers = async (req, res) => {
    try {
        const drivers = await Driver.find().populate('binAssignments', 'binId address status').populate('records');

        const driverData = drivers.map(driver => ({
            ...driver.toObject(),
            location: driver.location,
            notifications: driver.notifications,
            lastUpdated: driver.lastUpdated,
        }));

        res.status(200).json(driverData);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch drivers and records' });
    }
};

exports.registerDriver = async (req, res) => {
    const apiKey = req.headers['x-api-key'];
    const ADMIN_API_KEY = process.env.ADMIN_API_KEY;

    if (apiKey !== ADMIN_API_KEY) {
        return res.status(403).json({ error: 'Unauthorized access: Invalid API key' });
    }

    try {
        const driverData = {
            ...req.body,
            profileUrl: req.body.profileUrl || 'https://www.pngarts.com/files/10/Default-Profile-Picture-Download-PNG-Image.png',
        };

        const driver = new Driver(driverData);
        await driver.save();
        res.status(201).json({ message: 'Driver registered successfully', driver });
    } catch (error) {
        res.status(500).json({ error: `Failed to register driver: ${error.message}` });
    }
};

exports.updateDriver = async (req, res) => {
    const { driverId } = req.body;  

    if (!driverId) {
        return res.status(400).json({ error: 'Driver ID is required in the body' });
    }

    try {
        const updatedDriver = await Driver.findOneAndUpdate(
            { driverId },
            { $set: req.body },  
            { new: true, runValidators: true }
        );

        if (!updatedDriver) {
            return res.status(404).json({ error: 'Driver not found' });
        }

        res.status(200).json({ message: 'Driver updated successfully', updatedDriver });
    } catch (error) {
        res.status(500).json({ error: `Failed to update driver: ${error.message}` });
    }
};



exports.updateDriverLocation = async (req, res) => {
    const { driverId, latitude, longitude } = req.body;
    try {
        const driver = await Driver.findOneAndUpdate(
            { driverId },
            { location: { latitude, longitude }, lastUpdated: Date.now() },
            { new: true }
        );

        if (driver) {
            res.status(200).json({ message: 'Driver location updated', driver });
        } else {
            res.status(404).json({ error: 'Driver not found' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Failed to update driver location' });
    }
};
