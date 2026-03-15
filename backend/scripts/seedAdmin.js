require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

const createAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    const adminExists = await User.findOne({ role: 'admin' });
    if (adminExists) {
      console.log('Admin already exists');
      process.exit(0);
    }

    const admin = new User({
      username: process.env.ADMIN_EMAIL || 'sunnychaudhary3792@gmail.com',
      password: process.env.ADMIN_PASSWORD || 'siya3017',
      role: 'admin',
      allowedSearchLimit: 999999,
      expiryDate: new Date('2099-12-31')
    });

    await admin.save();
    console.log('Admin user created successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error creating admin user:', error);
    process.exit(1);
  }
};

createAdmin();
