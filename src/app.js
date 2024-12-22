const express = require('express');
const cors = require('cors');
const binRoutes = require('./routes/binRoutes');
const driverRoutes = require('./routes/driverRoutes');
const adminRoutes = require('./routes/adminRoutes');

const app = express();

app.use(cors());
app.use(express.json());
app.use('/api', adminRoutes); 
app.use('/api', binRoutes);
app.use('/api', driverRoutes);

module.exports = app;
