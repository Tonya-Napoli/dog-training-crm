// createFirstAdmin.js - Simple script to create your first admin
import 'dotenv/config';
import mongoose from 'mongoose';
import User from './src/api/models/User.js';

const createFirstAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');
    
    // Get admin details from environment variables
    const adminEmail = process.env.INITIAL_ADMIN_EMAIL || 'admin@puppyprostraining.com';
    const adminPassword = process.env.INITIAL_ADMIN_PASSWORD || 'admin123';
    
    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: adminEmail });
    
    if (existingAdmin) {
      console.log('✅ Admin account already exists!');
      console.log('Login with:');
      console.log(`Email: ${adminEmail}`);
      console.log('Password: admin123 (if unchanged)');
      console.log(`Role: ${existingAdmin.role}`);
      return;
    }
    
    // Create admin account
    const admin = new User({
      firstName: 'Admin',
      lastName: 'User',
      email: adminEmail,
      password: adminPassword, // autohashed
      role: 'admin',
      agreesToTerms: true
    });
    
    await admin.save();
    
    console.log('🎉 First admin account created successfully!');
    console.log('');
    console.log('Login credentials:');
    console.log(`📧 Email: ${adminEmail}`);
    console.log(`🔒 Password: ${adminPassword}`);
    console.log('');
    console.log('🌐 Login at: http://localhost:3000/login');
    console.log('📊 Admin dashboard: http://localhost:3000/admin-dashboard');
    console.log('');
    console.log('⚠️  IMPORTANT: Change the password after first login!');
    
  } catch (error) {
    console.error('❌ Error creating admin:', error.message);
  } finally {
    await mongoose.connection.close();
    console.log('✅ Database connection closed');
    process.exit(0);
  }
};

createFirstAdmin();