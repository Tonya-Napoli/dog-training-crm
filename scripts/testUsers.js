// testUsers.js
import 'dotenv/config';
import mongoose from 'mongoose';
import User from './src/api/models/User.js';

const checkUsers = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    
    const trainers = await User.find({ role: 'trainer' });
    const clients = await User.find({ role: 'client' });
    
    console.log(`Found ${trainers.length} trainers:`);
    trainers.forEach(t => console.log(`- ${t.firstName} ${t.lastName} (${t.email})`));
    
    console.log(`\nFound ${clients.length} clients:`);
    clients.forEach(c => console.log(`- ${c.firstName} ${c.lastName} (${c.email})`));
    
    await mongoose.connection.close();
  } catch (error) {
    console.error('Error:', error);
  }
};

checkUsers();