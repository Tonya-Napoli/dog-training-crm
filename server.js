// src/server.js
import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import emailRoutes from './src/api/routes/emailRoutes.js'; 

// Check for SendGrid API key
if (!process.env.SENDGRID_API_KEY) {
  console.error('SENDGRID_API_KEY is missing. Check your .env file.');
  process.exit(1);
}

const app = express();
const port = process.env.PORT || 4000;

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

// Routes
app.use('/api', emailRoutes);

// Default route
app.get('/', (req, res) => {
  res.send('Welcome to the Puppy Pros Training API');
});

// Start server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

