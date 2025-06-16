import 'dotenv/config';
import mongoose from 'mongoose';
import User from './src/api/models/User.js';

mongoose.connect(process.env.MONGODB_URI)
  .then(async () => {
    console.log('Connected to MongoDB');
    const users = await User.find({}).select('email role firstName lastName');
    console.log('Users in database:');
    users.forEach(u => {
      console.log(`Email: ${u.email}, Role: ${u.role}, Name: ${u.firstName} ${u.lastName}`);
    });
    await mongoose.connection.close();
  })
  .catch(err => console.error('Error:', err));