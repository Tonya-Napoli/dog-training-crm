const express = require('express');
const router = express.Router();

// Mount each route file under a desired sub-path.
router.use('/admin', require('./adminRoutes'));
router.use('/client', require('./clientRoutes'));
router.use('/company', require('./companyRoutes'));
router.use('/messenger', require('./messengerRoutes'));
router.use('/notification', require('./notificationRoutes'));
router.use('/sendgrid', require('./sendgridRoutes'));
router.use('/subscriber', require('./subscriberRoutes'));
router.use('/user', require('./userRoutes'));

// Optionally, add a base route for the API.
router.get('/', (req, res) => {
  res.send('Welcome to the Dog Training CRM API');
});

module.exports = router;
