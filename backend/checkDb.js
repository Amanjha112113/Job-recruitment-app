require('dotenv').config();
const mongoose = require('mongoose');

async function run() {
    await mongoose.connect(process.env.MONGO_URI);
    const User = require('./models/User');
    const Job = require('./models/Job');
    const Application = require('./models/Application');

    const users = await User.find({});
    console.log("Users:", users.map(u => ({ id: u._id, email: u.email, role: u.role })));

    const apps = await Application.find({});
    console.log("Apps Count:", apps.length);
    if (apps.length > 0) {
        console.log("Sample app job ID:", apps[0].job);
        console.log("Sample app applicant ID:", apps[0].applicant);
    }

    const jobs = await Job.find({});
    console.log("Job Count:", jobs.length);
    if (jobs.length > 0) {
        console.log("Sample job ID:", jobs[0]._id);
    }

    process.exit(0);
}

run().catch(console.error);
