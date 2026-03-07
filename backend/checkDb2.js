require('dotenv').config();
const mongoose = require('mongoose');

async function run() {
    await mongoose.connect(process.env.MONGO_URI);
    const Application = require('./models/Application');
    const Job = require('./models/Job');

    const apps = await Application.find({ applicant: '699626e193c8d5a2f74b5e2e' }).populate('job');
    console.log("Apps for amanjhastudy112@gmail.com:", apps.length);
    apps.forEach(app => {
        console.log("App ID:", app._id);
        if (app.job) {
            console.log("  Job ID:", app.job._id.toString());
            console.log("  Job Company:", app.job.company);
        } else {
            console.log("  Job: null! (it was deleted?)", app.job);
        }
    });

    const job = await Job.findById('6996244eb60c96bf02d9ee52');
    console.log("Is the Job AMANASU still in DB?", job ? "Yes" : "No");

    process.exit(0);
}

run().catch(console.error);
