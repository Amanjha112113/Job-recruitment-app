const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');

dotenv.config({ path: '../.env' });

const approveUser = async () => {
    const email = process.argv[2];
    if (!email) {
        console.log('Please provide an email address');
        process.exit(1);
    }

    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/recruitment');
        console.log('MongoDB Connected');

        const user = await User.findOne({ email });
        if (!user) {
            console.log('User not found');
            process.exit(1);
        }

        user.status = 'active';
        await user.save();

        console.log(`User ${user.email} approved (status: active)`);
        process.exit();
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

approveUser();
