import 'dotenv/config';
import mongoose from 'mongoose';
import User from '../src/api/models/User.js';

const createInitialAdmin = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Check if admin already exists
    const existingAdmin = await User.findOne({ role: 'admin' });
    if (existingAdmin) {
      console.log('Admin user already exists:', existingAdmin.email);
      process.exit(0);
    }

    // Validate required environment variables first
    if (!process.env.INITIAL_ADMIN_EMAIL || !process.env.INITIAL_ADMIN_PASSWORD) {
      console.error('Missing required environment variables:');
      console.error('Please set the following in your .env file:');
      console.error('- INITIAL_ADMIN_EMAIL');
      console.error('- INITIAL_ADMIN_PASSWORD');
      console.error('- INITIAL_ADMIN_FIRST_NAME (optional)');
      console.error('- INITIAL_ADMIN_LAST_NAME (optional)');
      process.exit(1);
    }

    // Create initial admin from environment variables (no fallbacks for security)
    const adminData = {
      firstName: process.env.INITIAL_ADMIN_FIRST_NAME || 'Admin',
      lastName: process.env.INITIAL_ADMIN_LAST_NAME || 'User',
      email: process.env.INITIAL_ADMIN_EMAIL,
      password: process.env.INITIAL_ADMIN_PASSWORD,
      role: 'admin',
      agreesToTerms: true
    };

    const admin = new User(adminData);
    await admin.save();

    console.log('Initial admin account created successfully!');
    console.log('Email:', adminData.email);
    console.log('Password:', adminData.password);
    console.log('\nIMPORTANT: Please change the password after first login!');

  } catch (error) {
    console.error('Error creating admin account:', error.message);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
  }
};

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  createInitialAdmin();
}

export default createInitialAdmin;