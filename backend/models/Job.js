const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
    title: { type: String, required: true },
    company: { type: String, required: true },
    location: { type: String, required: true },
    type: { type: String, required: true }, // Full-time, Internship, etc.
    department: { type: String },
    description: { type: String, required: true },
    salary: { type: String }, // Keep for backward compatibility or display text
    minSalary: { type: Number },
    maxSalary: { type: Number },
    experienceLevel: {
        type: String,
        enum: ['Entry Level', 'Mid Level', 'Senior Level', 'Executive', 'Internship'],
        default: 'Entry Level'
    },
    postedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    // status: { type: String, enum: ['open', 'closed'], default: 'open' }
}, { timestamps: true });

module.exports = mongoose.model('Job', jobSchema);
