const express = require('express');
const router = express.Router();
const Job = require('../models/Job');
const Application = require('../models/Application');
const { protect, admin } = require('../middleware/authMiddleware');

// --- JOBS ---

// @route   GET /api/jobs
// @desc    Get all jobs (with filters)
// @access  Public
router.get('/', async (req, res) => {
    try {
        const { search, department, location, type, minSalary } = req.query;
        let query = {};

        if (search) {
            query.$or = [
                { title: { $regex: search, $options: 'i' } },
                { company: { $regex: search, $options: 'i' } }
            ];
        }
        if (department) query.department = department;
        if (location) query.location = { $regex: location, $options: 'i' };
        if (type) query.type = type;

        // Simple salary check if salary is just number, but it is string mostly. 
        // Skipping complex salary logic for now.

        const jobs = await Job.find(query).sort({ createdAt: -1 });
        res.json({ success: true, jobs, total: jobs.length });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Server Error' });
    }
});

// @route   GET /api/jobs/stats
// @desc    Get dashboard stats
// @access  Private
router.get('/stats', protect, async (req, res) => {
    try {
        let stats = {
            jobsCount: 0,
            applicationsCount: 0,
            usersCount: 0
        };

        if (req.user.role === 'Admin') {
            stats.jobsCount = await Job.countDocuments();
            stats.applicationsCount = await Application.countDocuments();
            stats.usersCount = await require('../models/User').countDocuments();
        } else if (req.user.role === 'Recruiter') {
            // Jobs posted by this recruiter
            const jobs = await Job.find({ postedBy: req.user._id });
            stats.jobsCount = jobs.length;

            // Applications for those jobs
            const jobIds = jobs.map(job => job._id);
            stats.applicationsCount = await Application.countDocuments({ job: { $in: jobIds } });
        } else {
            // Job Seeker
            stats.jobsCount = await Job.countDocuments(); // Available jobs
            stats.applicationsCount = await Application.countDocuments({ applicant: req.user._id });
        }

        res.json({ success: true, stats });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
});

// @route   POST /api/jobs
// @desc    Create a job
// @access  Recruiter/Admin
router.post('/', protect, async (req, res) => {
    if (req.user.role !== 'Recruiter' && req.user.role !== 'Admin') {
        return res.status(403).json({ message: 'Not authorized' });
    }

    try {
        const job = await Job.create({
            ...req.body,
            postedBy: req.user._id,
            company: req.user.companyName || req.body.company // Fallback
        });
        res.status(201).json({ success: true, job });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Server Error' });
    }
});

// @route   DELETE /api/jobs/:id
// @desc    Delete a job
// @access  Recruiter/Admin
router.delete('/:id', protect, async (req, res) => {
    try {
        const job = await Job.findById(req.params.id);
        if (!job) return res.status(404).json({ message: 'Job not found' });

        if (req.user.role !== 'Admin' && job.postedBy.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        await job.remove();
        res.json({ success: true, message: 'Job removed' });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Server Error' });
    }
});


// --- APPLICATIONS ---

// @route   POST /api/jobs/:id/apply
// @desc    Apply to a job
// @access  Student
router.post('/:id/apply', protect, async (req, res) => {
    if (req.user.role === 'Recruiter') {
        return res.status(400).json({ message: 'Recruiters cannot apply' });
    }

    try {
        const job = await Job.findById(req.params.id);
        if (!job) return res.status(404).json({ message: 'Job not found' });

        const existingApp = await Application.findOne({ job: req.params.id, applicant: req.user._id });
        if (existingApp) {
            return res.status(400).json({ message: 'Already applied' });
        }

        const application = await Application.create({
            job: req.params.id,
            applicant: req.user._id,
            resume: req.user.resume || req.body.resume, // Use profile resume or one sent in body
        });

        res.status(201).json({ success: true, application });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
});

// @route   GET /api/jobs/my-applications
// @desc    Get user applications
// @access  Student
router.get('/my-applications', protect, async (req, res) => {
    try {
        const applications = await Application.find({ applicant: req.user._id })
            .populate('job', 'title company location type');

        // Transform for frontend expectation if needed, or update frontend to read this structure
        res.json({
            success: true, applications: applications.map(app => ({
                ...app.toObject(),
                jobId: app.job._id, // Add convenience fields
                jobTitle: app.job.title,
                company: app.job.company
            }))
        });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Server Error' });
    }
});

// @route   GET /api/jobs/applications/all
// @desc    Get all applications for a recruiter's jobs
// @access  Recruiter
router.get('/applications/all', protect, async (req, res) => {
    if (req.user.role !== 'Recruiter' && req.user.role !== 'Admin') {
        return res.status(403).json({ message: 'Not authorized' });
    }

    try {
        // Find jobs posted by this recruiter
        const jobs = await Job.find({ postedBy: req.user._id });
        const jobIds = jobs.map(job => job._id);

        // Find applications for these jobs
        const applications = await Application.find({ job: { $in: jobIds } })
            .populate('applicant', 'name email resume skills cgpa year department')
            .populate('job', 'title company location type')
            .sort({ createdAt: -1 });

        res.json({ success: true, applications });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Server Error' });
    }
});

// @route   GET /api/jobs/:id/applications
// @desc    Get applications for a job
// @access  Recruiter/Admin
router.get('/:id/applications', protect, async (req, res) => {
    try {
        const job = await Job.findById(req.params.id);
        if (!job) return res.status(404).json({ message: 'Job not found' });

        if (req.user.role !== 'Admin' && job.postedBy.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        const applications = await Application.find({ job: req.params.id })
            .populate('applicant', 'name email resume skills cgpa year department');

        res.json({ success: true, applications });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Server Error' });
    }
});

// @route   PUT /api/jobs/applications/:id
// @desc    Update application status
// @access  Recruiter/Admin
router.put('/applications/:id', protect, async (req, res) => {
    try {
        const { status, feedback } = req.body;
        const application = await Application.findById(req.params.id).populate('job');

        if (!application) return res.status(404).json({ message: 'Application not found' });

        if (!application.job) {
            return res.status(404).json({ message: 'Job associated with this application not found' });
        }

        // Check if user owns the job
        if (req.user.role !== 'Admin' && application.job.postedBy.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        if (status) application.status = status;
        if (feedback) application.feedback = feedback;

        await application.save();
        res.json({ success: true, application });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Server Error' });
    }
});

module.exports = router;
