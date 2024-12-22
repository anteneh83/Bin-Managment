const Driver = require('../models/Driver');
const Record = require('../models/Record');
const Bin = require('../models/Bin');

exports.getDrivers = async (req, res) => {
    try {
        const drivers = await Driver.find();

        const driverData = await Promise.all(
            drivers.map(async (driver) => {
                const records = await Record.find({ driverId: driver.driverId });

                const binAssignments = await Promise.all(
                    driver.binAssignments.map(async (binId) => {
                        const bin = await Bin.findOne({ binId })
                            .select('binId address status');  

                        return bin;
                    })
                );

                return {
                    ...driver.toObject(),
                    records: records,
                    binAssignments: binAssignments  
                };
            })
        );

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
        const driver = new Driver(req.body);
        await driver.save(); 
        res.status(201).json({ message: 'Driver registered successfully', driver });
    } catch (error) {
        res.status(500).json({ error: `Failed to register driver: ${error.message}` });
    }
};