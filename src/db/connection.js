// testConnection.js
import 'dotenv/config';
import connectDB from './src/db/connection.js';
import mongoose from 'mongoose';

// Test function
const testConnection = async () => {
  try {
    // Connect to MongoDB
    await connectDB();
    console.log('Connection successful!');
    
    // Show database name
    console.log(`Connected to database: ${mongoose.connection.name}`);
    
    // List all collections
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('Available collections:');
    if (collections.length === 0) {
      console.log('  No collections found (this is normal for a new database)');
    } else {
      collections.forEach(collection => {
        console.log(`  - ${collection.name}`);
      });
    }
    
    console.log('\nYour MongoDB connection is working correctly!');
  } catch (error) {
    console.error('Error testing connection:', error);
  } finally {
    // Close the connection
    await mongoose.connection.close();
    console.log('Connection closed');
  }
};

// Run the test
testConnection();