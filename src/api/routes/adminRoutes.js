// adminRoutes.js
const express = require('express');
const router = express.Router();

// GET /admin/ - Admin dashboard or welcome route
router.get('/', (req, res) => {
  res.json({ message: 'Welcome to the Admin Dashboard' });
});

// GET /admin/users - Retrieve a list of users (example endpoint)
router.get('/users', (req, res) => {
  // Replace this with your actual logic to fetch users
  const dummyUsers = [
    { id: 1, name: 'Alice Admin', role: 'admin' },
    { id: 2, name: 'Bob Manager', role: 'manager' },
    { id: 3, name: 'Charlie User', role: 'user' },
  ];
  res.json({ users: dummyUsers });
});

// POST /admin/user - Create a new admin user (example endpoint)
router.post('/user', (req, res) => {
  const { name, email } = req.body;
  // In a real application, you would save the new admin user to your database
  const newUser = {
    id: Date.now(), // For demonstration only
    name,
    email,
    role: 'admin'
  };
  res.status(201).json({ message: 'Admin user created', user: newUser });
});

// PUT /admin/user/:id - Update an admin user's details (example endpoint)
router.put('/user/:id', (req, res) => {
  const userId = req.params.id;
  const updateData = req.body;
  // Replace with actual update logic in your database
  res.json({ message: `User ${userId} updated`, update: updateData });
});

// DELETE /admin/user/:id - Delete an admin user (example endpoint)
router.delete('/user/:id', (req, res) => {
  const userId = req.params.id;
  // Replace with actual deletion logic
  res.json({ message: `User ${userId} deleted` });
});

module.exports = router;
