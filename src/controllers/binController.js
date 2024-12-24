const Bin = require('../models/Bin');
const Driver = require('../models/Driver');
const Record = require('../models/Record');
const nodemailer = require('nodemailer');
const geolib = require('geolib');
const sendEmailNotification = require('../utils/email');

const transporter = nodemailer.createTransport({
    service: 'gmail', 
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS, 
    },
});


exports.registerBin = async (req, res) => {
    const apiKey = req.headers['x-api-key'];
    const ADMIN_API_KEY = process.env.ADMIN_API_KEY;

    if (apiKey !== ADMIN_API_KEY) {
        return res.status(403).json({ error: 'Unauthorized access: Invalid API key' });
    }

    const {
        binId,
        imageUrl = 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRO1P8EFDdCVnDCbSFVXry0OpmwHNxk2996RtYzcKFXgb2-pKFkNrx_yOdMv8WLlC0cdho&usqp=CAU',
        address,
        latitude,
        longitude,
        status = 'active',
        currentFillLevel = 0,
        lidStatus = 'closed',
    } = req.body;

    try {
        const existingBin = await Bin.findOne({ binId });
        if (existingBin) {
            return res.status(400).json({ error: 'Bin with this ID already exists' });
        }

        const newBin = new Bin({
            binId,
            imageUrl,
            address,
            latitude,
            longitude,
            status,
            currentFillLevel,
            lidStatus,
        });

        const savedBin = await newBin.save();

        res.status(201).json(savedBin);
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: 'Failed to register bin' });
    }
};


exports.updateBinStatus = async (req, res) => {
    const { binId, currentFillLevel, latitude, longitude, address } = req.body;
    try {
        const bin = await Bin.findOneAndUpdate(
            { binId },
            { currentFillLevel, latitude, longitude, address, lastUpdated: Date.now() },
            { upsert: true, new: true }
        );

        let nearestDriver = null;
        let minDistance = Infinity;

        if (bin.currentFillLevel >= 85) {
            console.log('Bin is full!');
            const drivers = await Driver.find();

            drivers.forEach((driver) => {
                const distance = geolib.getDistance(
                    { latitude: bin.latitude, longitude: bin.longitude },
                    { latitude: driver.location.latitude, longitude: driver.location.longitude }
                );

                if (distance < minDistance) {
                    minDistance = distance;
                    nearestDriver = driver;
                }
            });

            if (nearestDriver) {
                bin.assignedStatus = 'assigned';

                const newRecord = new Record({
                    recordId: `REC${Date.now()}`, 
                    binId: bin.binId,
                    driverId: nearestDriver.driverId,
                    action: 'bin assigned',
                    timestamp: Date.now(),
                    notes: `Assigned to driver ${nearestDriver.firstName} ${nearestDriver.lastName}.`
                });

                await newRecord.save();

                const subject = `Bin ${binId} is Full`;
                const message = `Dear ${nearestDriver.firstName},\n\nThe bin located at ${bin.address} is full. Please attend to it as soon as possible.\n\nThank you!`;

                try {
                    const emailResponse = await sendEmailNotification(nearestDriver.email, subject, message);
                    console.log('Email sent:', emailResponse);
                    nearestDriver.binAssignments.push(bin._id);
                    await nearestDriver.save();
                    res.status(200).json(bin);
                } catch (error) {
                    console.log(error);
                    res.status(500).json({ error: 'Failed to send email notification' });
                }
            } else {
                console.log('No driver found');
                res.status(404).json({ error: 'No driver found to send notification' });
            }
        } else {
            res.status(200).json(bin);
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: 'Failed to update bin data' });
    }
};

exports.getBinStatus = async (req, res) => {
    try {
        const bins = await Bin.find(); 
        res.status(200).json(bins);   
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch bin data' });
    }
};


exports.modifyBinStatus = async (req, res) => {
    const apiKey = req.headers['x-api-key'];
    const ADMIN_API_KEY = process.env.ADMIN_API_KEY;

    if (apiKey !== ADMIN_API_KEY) {
        return res.status(403).json({ error: 'Unauthorized access: Invalid API key' });
    }

    const DEFAULT_IMAGE_URL = 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRO1P8EFDdCVnDCbSFVXry0OpmwHNxk2996RtYzcKFXgb2-pKFkNrx_yOdMv8WLlC0cdho&usqp=CAU';
    const {
        binId,
        currentFillLevel,
        latitude,
        longitude,
        address,
        assignedStatus = 'unassigned',
    } = req.body;

    try {
        const existingBin = await Bin.findOne({ binId });

        if (existingBin) {
            existingBin.currentFillLevel = currentFillLevel;
            existingBin.latitude = latitude;
            existingBin.longitude = longitude;
            existingBin.address = address;
            existingBin.assignedStatus = assignedStatus;
            existingBin.imageUrl = DEFAULT_IMAGE_URL;

            const updatedBin = await existingBin.save();
            return res.status(200).json({ message: 'Bin status updated successfully', bin: updatedBin });
        }

        const newBin = new Bin({
            binId,
            currentFillLevel,
            latitude,
            longitude,
            address,
            assignedStatus,
            imageUrl: DEFAULT_IMAGE_URL,
        });

        const savedBin = await newBin.save();
        return res.status(201).json({ message: 'Bin created successfully', bin: savedBin });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to modify bin status' });
    }
};
