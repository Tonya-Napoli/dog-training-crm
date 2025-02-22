import express from 'express';
import cors from 'cors';
import emailRoutes from './routes/emailRoutes'; // Ensure this file exists

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Email route
app.use('/email', emailRoutes);

// Default API route
app.get('/', (req, res) => {
  res.send('Welcome to the Puppy Pros Training API');
});

export default app;



