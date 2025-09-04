import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import emailRoutes from './src/api/routes/emailRoutes.js';
import authRoutes from './src/api/routes/authRoutes.js';
import trainerRoutes from './src/api/routes/trainerRoutes.js';
import billingRoutes from './src/api/routes/billingRoutes.js';
import sessionRoutes from './src/api/routes/sessionRoutes.js';
import inviteRoutes from './src/api/routes/inviteRoutes.js';
import reportRoutes from './src/api/routes/reportRoutes.js';

console.log('SERVER STARTING');

if (!process.env.RESEND_API_KEY) {
  console.error('RESEND_API_KEY is missing. Check your .env file.');
  process.exit(1);
}

// Initialize Express
const app = express();
const port = process.env.PORT || 4000;

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB connected successfully'))
  .catch(err => console.error('MongoDB connection error:', err));

// Middleware
app.use(cors());
app.use(express.json());

// Handle JSON parsing errors
app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    console.error('Invalid JSON:', err);
    return res.status(400).json({ error: 'Invalid JSON' });
  }
  next();
});

app.use((req, res, next) => {
  console.log(`📥 ${new Date().toISOString()} - ${req.method} ${req.url}`);
  console.log('Request body:', req.body);
  next();
});

// Routes
app.use('/api', emailRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/trainers', trainerRoutes);
app.use('/api/billing', billingRoutes);
app.use('/api/sessions', sessionRoutes);
app.use('/api/invites', inviteRoutes);
app.use('/api/reports', reportRoutes);

// Default route
app.get('/', (req, res) => {
  res.send('Welcome to the Puppy Pros Training API');
});

// Start server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
