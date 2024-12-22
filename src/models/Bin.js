const mongoose = require('mongoose');

const binSchema = new mongoose.Schema({
    binId: { type: String, required: true, unique: true },
    imageUrl: { type: String, required: true },
    address: { type: String, required: true },
    status: { type: String, default: "active" },
    assignedStatus: { type: String, default: "unassigned" },
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true },
    currentFillLevel: { type: Number, default: 0 },
    lidStatus: { type: String, default: "closed" },
    lastUpdated: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Bin', binSchema, 'bins');
