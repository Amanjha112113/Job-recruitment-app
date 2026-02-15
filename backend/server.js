const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true
}));
app.use(express.json());
app.use('/uploads', express.static('uploads')); // Serve uploaded files

// Database Connection
mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/recruitment')
    .then(() => console.log('MongoDB Connected'))
    .catch(err => console.error('MongoDB Connection Error:', err));

// Routes
app.get('/', (req, res) => {
    res.send('API is running...');
});

// Import Routes
const authRoutes = require('./routes/auth');
app.use('/api/auth', authRoutes);

const jobRoutes = require('./routes/jobs');
app.use('/api/jobs', jobRoutes);

const resumeRoutes = require('./routes/resume');
app.use('/api/resume', resumeRoutes);

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
