// scripts/fixUsernames.js - Fix users with null usernames
import 'dotenv/config';
import mongoose from 'mongoose';
import User from '../src/api/models/User.js';

const fixUsernames = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');
    
    // Find all users and show current state
    console.log('\n📊 Current users in database:');
    const allUsers = await User.find({});
    allUsers.forEach((user, index) => {
      console.log(`${index + 1}. ${user.firstName} ${user.lastName} (${user.email})`);
      console.log(`   Role: ${user.role}`);
      console.log(`   Username: ${user.username || 'NULL/UNDEFINED'}`);
      console.log('');
    });
    
    // Find users with null/undefined usernames
    const usersWithoutUsername = await User.find({
      $or: [
        { username: null },
        { username: undefined },
        { username: { $exists: false } },
        { username: '' }
      ]
    });
    
    console.log(`🔍 Found ${usersWithoutUsername.length} users with missing usernames`);
    
    if (usersWithoutUsername.length === 0) {
      console.log('✅ No username conflicts found!');
      return;
    }
    
    // Fix each user's username
    for (let i = 0; i < usersWithoutUsername.length; i++) {
      const user = usersWithoutUsername[i];
      
      console.log(`\n🔧 Fixing user: ${user.firstName} ${user.lastName} (${user.email})`);
      
      // Generate a username based on email or name
      let newUsername;
      if (user.email) {
        // Use the part before @ symbol
        newUsername = user.email.split('@')[0].toLowerCase();
      } else {
        // Use name if no email
        newUsername = `${user.firstName}${user.lastName}`.toLowerCase().replace(/\s+/g, '');
      }
      
      // Remove any special characters
      newUsername = newUsername.replace(/[^a-z0-9]/g, '');
      
      // Make sure username is unique
      let counter = 1;
      let finalUsername = newUsername;
      
      while (await User.findOne({ username: finalUsername, _id: { $ne: user._id } })) {
        finalUsername = `${newUsername}${counter}`;
        counter++;
      }
      
      // Update the user
      console.log(`   Setting username to: ${finalUsername}`);
      user.username = finalUsername;
      await user.save();
      
      console.log(`✅ Fixed: ${user.firstName} ${user.lastName} → username: ${finalUsername}`);
    }
    
    console.log('\n🎉 All username conflicts resolved!');
    console.log('Now you can run createInitialAdmin.js again.');
    
    // Show final state
    console.log('\n📊 Updated users in database:');
    const updatedUsers = await User.find({});
    updatedUsers.forEach((user, index) => {
      console.log(`${index + 1}. ${user.firstName} ${user.lastName} (${user.email})`);
      console.log(`   Role: ${user.role}`);
      console.log(`   Username: ${user.username}`);
      console.log('');
    });
    
  } catch (error) {
    console.error('❌ Error fixing usernames:', error.message);
  } finally {
    await mongoose.connection.close();
    console.log('✅ Database connection closed');
  }
};

console.log('🔧 Starting username fix process...');
fixUsernames().then(() => {
  console.log('🏁 Username fix completed');
}).catch((error) => {
  console.error('💥 Fix process failed:', error);
});