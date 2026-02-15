const mongoose = require('mongoose');
const User = require('./models/User');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');

dotenv.config();

mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/recruitment')
    .then(async () => {
        const email = 'amanjhastudy112@gmail.com';
        const user = await User.findOne({ email });
        if (user) {
            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash('password123', salt);
            await user.save();
            console.log(`Password for ${email} reset to 'password123'`);
        } else {
            console.log('User not found');
        }
        process.exit();
    })
    .catch(err => {
        console.error(err);
        process.exit(1);
    });
