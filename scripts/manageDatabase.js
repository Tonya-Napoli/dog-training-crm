// scripts/manageDatabase.js
import 'dotenv/config';
import mongoose from 'mongoose';
import User from '../src/api/models/User.js';

const manageDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Get all users
    const users = await User.find({}).select('firstName lastName email role createdAt');
    
    console.log('\n Current Users in Database:');
    console.log('==========================================');
    
    if (users.length === 0) {
      console.log('   No users found in database');
    } else {
      users.forEach((user, index) => {
        console.log(`   ${index + 1}. ${user.firstName} ${user.lastName}`);
        console.log(`      Email: ${user.email}`);
        console.log(`      Role: ${user.role}`);
        console.log(`      Created: ${user.createdAt}`);
        console.log('');
      });
    }

    console.log(`\n Total Users: ${users.length}`);
    console.log(`   Admins: ${users.filter(u => u.role === 'admin').length}`);
    console.log(`   Trainers: ${users.filter(u => u.role === 'trainer').length}`);
    console.log(`   Clients: ${users.filter(u => u.role === 'client').length}`);

    // Check for specific emails you tried to register
    const testEmails = [
      'pupmail@puppyprostraining.com',
      'trainingchat@puppyprostraining.com', 
      'testemail@testemail.com'
    ];

    console.log('\n🔍 Checking specific emails:');
    for (const email of testEmails) {
      const exists = users.find(u => u.email === email);
      if (exists) {
        console.log(`    ${email} - ALREADY EXISTS (${exists.role})`);
      } else {
        console.log(`    ${email} - Available`);
      }
    }

    // Ask if user wants to clear non-admin users
    console.log('\n  Options:');
    console.log('   1. Keep all users');
    console.log('   2. Clear all NON-ADMIN users (keeps admin accounts safe)');
    console.log('   3. Clear ALL users (including admins - you\'ll need to recreate admin)');
    
    // For now, just show the data. User can uncomment the clearing code below if needed.
    console.log('\n💡 To clear users, uncomment the appropriate section in this script and run again.');
    
    // UNCOMMENT ONE OF THESE SECTIONS IF YOU WANT TO CLEAR USERS:
    
    // Option 2: Clear non-admin users only
    /*
    const nonAdminResult = await User.deleteMany({ role: { $ne: 'admin' } });
    console.log(`\n Deleted ${nonAdminResult.deletedCount} non-admin users`);
    console.log('Admin accounts preserved');
    */
    
    // Option 3: Clear ALL users (including admins)
    /*
    const allResult = await User.deleteMany({});
    console.log(`\n Deleted ${allResult.deletedCount} total users`);
    console.log(' All users deleted - you\'ll need to recreate admin with npm run create-admin');
    */

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Database connection closed');
  }
};

// Get command line argument
const action = process.argv[2];

if (action === 'clear-non-admin') {
  // Clear non-admin users
  const clearNonAdmin = async () => {
    try {
      await mongoose.connect(process.env.MONGODB_URI);
      const result = await User.deleteMany({ role: { $ne: 'admin' } });
      console.log(`Deleted ${result.deletedCount} non-admin users`);
      console.log('Admin accounts preserved');
    } catch (error) {
      console.error('Error:', error.message);
    } finally {
      await mongoose.connection.close();
    }
  };
  clearNonAdmin();
} else if (action === 'clear-all') {
  // Clear all users
  const clearAll = async () => {
    try {
      await mongoose.connect(process.env.MONGODB_URI);
      const result = await User.deleteMany({});
      console.log(`Deleted ${result.deletedCount} total users`);
      console.log('You\'ll need to recreate admin with: npm run create-admin');
    } catch (error) {
      console.error('Error:', error.message);
    } finally {
      await mongoose.connection.close();
    }
  };
  clearAll();
} else {
  // Just show database contents
  manageDatabase();
}