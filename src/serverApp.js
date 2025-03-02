// src/serverApp.js to define Express server
import express from 'express';
const app = express();

// Example route
app.get('/', (req, res) => {
  res.send('Hello from the server!');
});

// Add more routes and middleware as needed
export default app;