require('dotenv').config();
const mongoose = require('mongoose');

async function testMyApplications() {
    await mongoose.connect(process.env.MONGO_URI);
    const Application = require('./models/Application');
    const Job = require('./models/Job');
    try {
        const userId = '699626e193c8d5a2f74b5e2e'; // Job Seeker

        console.log("Connected to DB, finding apps");
        const applications = await Application.find({ applicant: userId }).populate('job', 'title company location type');

        console.log("Found apps:", applications.length);

        const mapped = applications.map(app => {
            console.log("Processing app:", app._id);
            const appObj = app.toObject();
            if (app.job) {
                return {
                    ...appObj,
                    jobId: app.job._id,
                    jobTitle: app.job.title,
                    company: app.job.company
                };
            }
            return appObj;
        });

        console.log("Mapped len:", mapped.length);
    } catch (e) {
        console.error("CRASH:", e);
    }
    process.exit(0);
}

testMyApplications();
