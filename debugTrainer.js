// debugTrainer.js
import 'dotenv/config';
import mongoose from 'mongoose';
import User from './src/api/models/User.js';

async function checkTrainerData() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');
    
    // Find Ryan (the trainer)
    const trainer = await User.findOne({ email: 'ryan@puppyprostraining.com' });
    
    if (trainer) {
      console.log('\n=== TRAINER DATA ===');
      console.log('Name:', trainer.firstName, trainer.lastName);
      console.log('Email:', trainer.email);
      console.log('Phone:', trainer.phone);
      console.log('Role:', trainer.role);
      console.log('\n=== TRAINER SPECIFIC FIELDS ===');
      console.log('Specialties:', trainer.specialties);
      console.log('Certifications:', trainer.certifications);
      console.log('Experience:', trainer.experience);
      console.log('Bio:', trainer.bio);
      console.log('Hourly Rate:', trainer.hourlyRate);
      console.log('Availability:', trainer.availability);
      console.log('\nFull trainer object:');
      console.log(JSON.stringify(trainer, null, 2));
    } else {
      console.log('Trainer not found');
    }
    
    await mongoose.connection.close();
  } catch (error) {
    console.error('Error:', error);
  }
}

checkTrainerData();