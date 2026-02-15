const mongoose = require('mongoose');

const resumeSchema = new mongoose.Schema({
    candidateId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true // One resume per candidate for now
    },
    cloudinaryPublicId: {
        type: String,
        required: true
    },
    fileName: {
        type: String,
        required: true
    },
    mimeType: {
        type: String,
        required: true
    },
    fileSize: {
        type: Number,
        required: true
    },
    uploadedAt: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });

module.exports = mongoose.model('Resume', resumeSchema);
