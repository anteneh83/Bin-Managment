const mongoose = require('mongoose');

const driverSchema = new mongoose.Schema({
    driverId: { type: String, required: true, unique: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    contact: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    profileUrl: { type: String },
    location: {
        latitude: { type: Number, required: true },
        longitude: { type: Number, required: true },
    },
    binAssignments: [
        { type: mongoose.Schema.Types.ObjectId, ref: 'Bin' }
    ],
    status: { type: String, enum: ['available', 'assigned', 'unavailable'], default: 'available' },
    notifications: {
        emailNotifications: { type: Boolean, default: true },
    },
    records: [
        { type: mongoose.Schema.Types.ObjectId, ref: 'Record' } 
    ],
    lastUpdated: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Driver', driverSchema);
