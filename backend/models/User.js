const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['Job Seeker', 'Recruiter', 'Admin'], default: 'Job Seeker' },
    googleId: { type: String, sparse: true, unique: true }, // For Google Auth
    avatar: { type: String }, // For Profile Picture

    // Common
    status: { type: String, enum: ['active', 'pending', 'deactivated'], default: 'active' },

    // Student Specific
    department: { type: String },
    year: { type: String },
    cgpa: { type: Number },
    skills: { type: String }, // Store as comma-separated string or array? String for simplicity based on frontend
    resume: { type: String }, // URL or filename

    // Recruiter Specific
    companyName: { type: String },

}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
