import 'dotenv/config';
import mongoose from 'mongoose';
import User from '../src/api/models/User.js';

const createInitialAdmin = async () => {
  try {
    console.log('🚀 Starting admin creation process...');
    
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');
    
    // Check if admin already exists
    console.log('🔍 Checking for existing admin users...');
    const existingAdmin = await User.findOne({ role: 'admin' });
    if (existingAdmin) {
      console.log('✅ Admin user already exists:', existingAdmin.email);
      console.log(`Name: ${existingAdmin.firstName} ${existingAdmin.lastName}`);
      console.log(`Username: ${existingAdmin.username || 'Not set'}`);
      console.log('\nUse existing credentials to login.');
      return; // Don't exit process, just return
    }
    
    console.log('📝 Validating environment variables...');
    // Validate required environment variables first
    if (!process.env.INITIAL_ADMIN_EMAIL || !process.env.INITIAL_ADMIN_PASSWORD) {
      console.error('❌ Missing required environment variables:');
      console.error('Please set the following in your .env file:');
      console.error('- INITIAL_ADMIN_EMAIL');
      console.error('- INITIAL_ADMIN_PASSWORD');
      console.error('- INITIAL_ADMIN_FIRST_NAME (optional)');
      console.error('- INITIAL_ADMIN_LAST_NAME (optional)');
      return;
    }
    
    console.log('🔍 Checking for email conflicts...');
    // Check for existing user with same email
    const existingUserWithEmail = await User.findOne({ 
      email: process.env.INITIAL_ADMIN_EMAIL 
    });
    
    if (existingUserWithEmail) {
      console.error('❌ A user with this email already exists!');
      console.error(`Existing user: ${existingUserWithEmail.firstName} ${existingUserWithEmail.lastName} (${existingUserWithEmail.role})`);
      console.error('Please use a different email in your .env file.');
      return;
    }
    
    console.log('👤 Generating unique username...');
    // Generate unique username to avoid duplicate key errors
    const baseUsername = 'admin';
    let username = baseUsername;
    let counter = 1;
    
    // Keep checking until we find an available username
    while (await User.findOne({ username: username })) {
      username = `${baseUsername}${counter}`;
      counter++;
    }
    
    if (username !== baseUsername) {
      console.log(`ℹ️  Username 'admin' taken, using '${username}' instead`);
    }
    
    console.log('✨ Creating admin user...');
    // Create initial admin from environment variables
    const adminData = {
      firstName: process.env.INITIAL_ADMIN_FIRST_NAME || 'Admin',
      lastName: process.env.INITIAL_ADMIN_LAST_NAME || 'User',
      username: username,
      email: process.env.INITIAL_ADMIN_EMAIL,
      password: process.env.INITIAL_ADMIN_PASSWORD,
      role: 'admin',
      agreesToTerms: true
    };
    
    console.log('💾 Saving to database...');
    const admin = new User(adminData);
    await admin.save();
    
    console.log('🎉 Initial admin account created successfully!');
    console.log('');
    console.log('Login credentials:');
    console.log(`👤 Username: ${username}`);
    console.log(`📧 Email: ${adminData.email}`);
    console.log(`🔒 Password: ${adminData.password}`);
    console.log('');
    console.log('🌐 Login at: http://localhost:3000/login');
    console.log('📊 Admin dashboard: http://localhost:3000/admin-dashboard');
    console.log('');
    console.log('⚠️  IMPORTANT: Please change the password after first login!');
    
  } catch (error) {
    console.error('❌ Error creating admin account:', error.message);
    if (error.code === 11000) {
      console.error('This appears to be a duplicate key error.');
      console.error('There might be conflicting data in your database.');
    }
  } finally {
    console.log('🔄 Closing database connection...');
    await mongoose.connection.close();
    console.log('✅ Database connection closed');
  }
};

// Always call the function when script runs
console.log('🎯 Calling createInitialAdmin function...');
createInitialAdmin().then(() => {
  console.log('🏁 Script completed');
}).catch((error) => {
  console.error('💥 Script failed:', error);
});

export default createInitialAdmin;