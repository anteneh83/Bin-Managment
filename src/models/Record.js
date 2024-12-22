const mongoose = require('mongoose');

const recordSchema = new mongoose.Schema({
    recordId: { type: String, required: true, unique: true },
    binId: { type: String, required: true },  
    driverId: { type: String, required: true }, 
    action: { type: String, required: true },
    timestamp: { type: Date, required: true },
    notes: { type: String }
});

module.exports = mongoose.model('Record', recordSchema);
