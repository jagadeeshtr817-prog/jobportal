const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
    jobId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Job',
        required: true
    },
    name: {
        type: String,
        required: true
    },
    jobTitle: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    experience: {
        type: Number,
        required: true
    },
    phone: {
        type: String,
        required: true
    },
    noticePeriod: {
        type: Number,
        required: true
    },
    expectedCtc: {
        type: Number,
        required: true
    },
    resumePath: {
        type: String,
        required: true
    },
    coverLetter: {
        type: String
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Application', applicationSchema);