require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const Application = require('./models/Application');
const Job = require('./models/Job');
const User = require('./models/User');

const app = express();
app.get('/test', async (req, res) => {
    try {
        const userId = '699626e193c8d5a2f74b5e2e';
        const applications = await Application.find({ applicant: userId }).populate('job', 'title company location type');

        res.json({
            success: true, applications: applications.map(app => {
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
            })
        });
    } catch (e) {
        console.error("EXPRESS CRASH", e);
        res.status(500).send(e.stack || e.message || e.toString());
    }
});

mongoose.connect(process.env.MONGO_URI).then(() => {
    const server = app.listen(5002, () => {
        console.log('Ready on 5002');
        require('child_process').exec('curl -s http://localhost:5002/test', (err, stdout) => {
            console.log("CURL OUTPUT:", stdout);
            server.close();
            process.exit(0);
        });
    });
});
