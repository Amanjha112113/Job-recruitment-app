const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Job = require('../models/Job');
const Application = require('../models/Application');
const User = require('../models/User');

dotenv.config({ path: './backend/.env' });

const debug = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to DB');

        const jobs = await Job.find({});
        console.log(`Found ${jobs.length} jobs`);
        jobs.forEach(j => console.log(`Job: ${j.title} (${j._id}) - PostedBy: ${j.postedBy}`));

        const apps = await Application.find({});
        console.log(`Found ${apps.length} applications`);
        apps.forEach(a => console.log(`App: Job ${a.job} - Applicant ${a.applicant} (${a._id})`));

        const users = await User.find({});
        console.log(`Found ${users.length} users`);
        users.forEach(u => console.log(`User: ${u.name} (${u._id}) - Role: ${u.role}`));

        process.exit();
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
};

debug();
