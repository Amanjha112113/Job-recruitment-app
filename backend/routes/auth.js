const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { protect } = require('../middleware/authMiddleware');
const { OAuth2Client } = require('google-auth-library');
const axios = require('axios');

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Generate JWT
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });
};

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
router.post('/register', async (req, res) => {
    const { name, email, password, role, department, year, cgpa, skills, resume, companyName } = req.body;

    try {
        console.log('Register Request Body:', req.body);
        const userExists = await User.findOne({ email });

        if (userExists) {
            console.log('User already exists:', email);
            return res.status(400).json({ message: 'User already exists' });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Determine status
        let status = 'active'; // Recruiters are now active by default
        // if (role === 'Recruiter') {
        //     status = 'pending';
        // }

        const user = await User.create({
            name,
            email,
            password: hashedPassword,
            role: role || 'Job Seeker',
            status,
            // Student specific
            department,
            year,
            cgpa,
            skills,
            resume,
            // Recruiter specific
            companyName,
        });

        if (user) {
            console.log('User created:', user._id);
            res.status(201).json({
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    status: user.status
                },
                token: generateToken(user._id),
            });
        } else {
            console.log('Invalid user data - User.create failed silently?');
            res.status(400).json({ message: 'Invalid user data' });
        }
    } catch (error) {
        console.error('Registration Error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   POST /api/auth/login
// @desc    Auth user & get token
// @access  Public
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });

        if (user && (await bcrypt.compare(password, user.password))) {
            if (user.status === 'pending') {
                return res.status(401).json({ message: 'Account is pending approval' });
            }
            if (user.status === 'deactivated') {
                return res.status(401).json({ message: 'Account is deactivated' });
            }

            res.json({
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    status: user.status
                },
                token: generateToken(user._id),
            });
        } else {
            res.status(401).json({ message: 'Invalid email or password' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   POST /api/auth/google
// @desc    Google login/register
// @access  Public
router.post('/google', async (req, res) => {
    const { token } = req.body;

    try {
        // Fetch user info using the access token
        const response = await axios.get('https://www.googleapis.com/oauth2/v3/userinfo', {
            headers: { Authorization: `Bearer ${token}` }
        });

        const data = response.data;
        const { name, email, picture, sub: googleId } = data;

        let user = await User.findOne({
            $or: [
                { googleId },
                { email }
            ]
        });

        console.log('Google Auth Debug - User found:', user ? user._id : 'No user found');
        let roleInput = req.body.role;
        // Normalize role to match Schema enum
        if (roleInput === 'job-seeker' || roleInput === 'Job Seeker') roleInput = 'Job Seeker';
        else if (roleInput === 'recruiter' || roleInput === 'Recruiter') roleInput = 'Recruiter';
        else roleInput = 'Job Seeker'; // Default

        console.log('Google Auth Debug - Normalized Role:', roleInput);

        if (user) {
            // If user exists but doesn't have googleId linked (e.g. signed up with email/password), link it
            if (!user.googleId) {
                user.googleId = googleId;
                if (!user.avatar) user.avatar = picture;
                await user.save();
            }

            // Check status
            if (user.status === 'pending') {
                return res.status(401).json({ message: 'Account is pending approval' });
            }
            if (user.status === 'deactivated') {
                return res.status(401).json({ message: 'Account is deactivated' });
            }

            return res.json({
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    status: user.status,
                    avatar: user.avatar
                },
                token: generateToken(user._id),
            });
        } else {
            // Create new user
            const newUser = await User.create({
                name,
                email,
                password: await bcrypt.hash(Math.random().toString(36).slice(-8), 10), // Random password
                role: roleInput, // Use normalized role
                status: 'active',
                googleId,
                avatar: picture
            });

            if (newUser) {
                return res.status(201).json({
                    user: {
                        id: newUser._id,
                        name: newUser.name,
                        email: newUser.email,
                        role: newUser.role,
                        status: newUser.status,
                        avatar: newUser.avatar
                    },
                    token: generateToken(newUser._id),
                });
            } else {
                return res.status(400).json({ message: 'Invalid user data' });
            }
        }

    } catch (error) {
        console.error('Google Auth Error:', error);
        res.status(500).json({
            message: 'Google authentication failed',
            error: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
});

// @route   GET /api/auth/me
// @desc    Get current user profile
// @access  Private
router.get('/me', protect, async (req, res) => {
    const user = await User.findById(req.user._id).select('-password');
    if (user) {
        res.json({ user });
    } else {
        res.status(404).json({ message: 'User not found' });
    }
});

// @route   PUT /api/auth/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', protect, async (req, res) => {
    const user = await User.findById(req.user._id);

    if (user) {
        user.name = req.body.name || user.name;
        user.email = req.body.email || user.email;
        if (req.body.password) {
            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(req.body.password, salt);
        }

        // Student specific
        user.department = req.body.department || user.department;
        user.year = req.body.year || user.year;
        user.cgpa = req.body.cgpa || user.cgpa;
        user.skills = req.body.skills || user.skills;
        user.resume = req.body.resume || user.resume;

        // Recruiter specific
        user.companyName = req.body.companyName || user.companyName;

        const updatedUser = await user.save();

        res.json({
            user: {
                id: updatedUser._id,
                name: updatedUser.name,
                email: updatedUser.email,
                role: updatedUser.role,
                status: updatedUser.status,
                department: updatedUser.department,
                year: updatedUser.year,
                cgpa: updatedUser.cgpa,
                skills: updatedUser.skills,
                resume: updatedUser.resume,
                companyName: updatedUser.companyName
            },
            token: generateToken(updatedUser._id),
        });
    } else {
        res.status(404).json({ message: 'User not found' });
    }
});

// @route   GET /api/auth/users
// @desc    Get all users
// @access  Admin
router.get('/users', protect, async (req, res) => {
    if (req.user.role !== 'Admin') {
        return res.status(403).json({ message: 'Not authorized as an admin' });
    }
    try {
        const users = await User.find({}).select('-password');
        res.json({ success: true, users });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   PUT /api/auth/users/:id
// @desc    Update user status
// @access  Admin
router.put('/users/:id', protect, async (req, res) => {
    if (req.user.role !== 'Admin') {
        return res.status(403).json({ message: 'Not authorized as an admin' });
    }
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        user.status = req.body.status || user.status;
        await user.save();

        res.json({ success: true, user });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   DELETE /api/auth/users/:id
// @desc    Delete user
// @access  Admin
router.delete('/users/:id', protect, async (req, res) => {
    if (req.user.role !== 'Admin') {
        return res.status(403).json({ message: 'Not authorized as an admin' });
    }
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        await user.remove(); // or User.deleteOne({ _id: req.params.id })
        res.json({ success: true, message: 'User removed' });
    } catch (error) {
        // user.remove might be deprecated in newer Mongoose
        try {
            await User.findByIdAndDelete(req.params.id);
            res.json({ success: true, message: 'User removed' });
        } catch (e) {
            res.status(500).json({ message: 'Server error' });
        }
    }
});

module.exports = router;
