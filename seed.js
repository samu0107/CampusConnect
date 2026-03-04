const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
require('dotenv').config();

const User = require('./models/User');

const seedDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB for seeding...');

    const adminExists = await User.findOne({ email: 'admin@campusconnect.lk' });

    if (adminExists) {
      console.log('Admin user already exists! You can log in with admin@campusconnect.lk');
      process.exit(0);
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('AdminPassword123', salt);

    
    const adminUser = new User({
      studentId: 'ADMIN_001',
      name: 'System Admin',
      email: 'admin@campusconnect.lk',
      password: hashedPassword,
      role: 'Admin',
    });

    await adminUser.save();
    console.log('✅ Admin user created successfully!');
    console.log('Email: admin@campusconnect.lk');
    console.log('Password: AdminPassword123');

    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();

