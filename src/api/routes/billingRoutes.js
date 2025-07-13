// Create: src/api/routes/billingRoutes.js
import express from 'express';
import Package from '../models/Package.js';
import ClientPackage from '../models/ClientPackage.js';
import Invoice from '../models/Invoice.js';
import Session from '../models/Session.js';
import User from '../models/User.js';
import auth from '../middleware/auth.js';

const router = express.Router();

// Middleware to check admin access
const adminAuth = async (req, res, next) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }
    next();
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// ======================
// PACKAGE ROUTES
// ======================

// Get all packages
router.get('/packages', auth, async (req, res) => {
  try {
    const packages = await Package.find({ isActive: true })
      .populate('createdBy', 'firstName lastName')
      .sort({ createdAt: -1 });
    
    res.json({ packages });
  } catch (error) {
    console.error('Error fetching packages:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create new package
router.post('/packages', auth, adminAuth, async (req, res) => {
  try {
    const { name, description, price, sessions, category, duration } = req.body;
    
    const pkg = new Package({
      name,
      description,
      price,
      sessions,
      category,
      duration,
      createdBy: req.user.id
    });
    
    await pkg.save();
    await pkg.populate('createdBy', 'firstName lastName');
    
    res.status(201).json({ package: pkg });
  } catch (error) {
    console.error('Error creating package:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update package
router.put('/packages/:id', auth, adminAuth, async (req, res) => {
  try {
    const pkg = await Package.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    ).populate('createdBy', 'firstName lastName');
    
    if (!pkg) {
      return res.status(404).json({ message: 'Package not found' });
    }
    
    res.json({ package: pkg });
  } catch (error) {
    console.error('Error updating package:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// ======================
// CLIENT PACKAGE ROUTES
// ======================

// Get client packages (with filtering)
router.get('/client-packages', auth, async (req, res) => {
  try {
    const { clientId, status } = req.query;
    let query = {};
    
    if (clientId) query.client = clientId;
    if (status) query.status = status;
    
    const clientPackages = await ClientPackage.find(query)
      .populate('client', 'firstName lastName email')
      .populate('package')
      .populate('trainer', 'firstName lastName')
      .sort({ createdAt: -1 });
    
    res.json({ clientPackages });
  } catch (error) {
    console.error('Error fetching client packages:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Assign package to client
router.post('/assign-package', auth, adminAuth, async (req, res) => {
  try {
    const { clientId, packageId, trainerId, createInvoice } = req.body;
    
    // Verify client and package exist
    const client = await User.findById(clientId);
    const trainingPackage = await Package.findById(packageId);
    
    if (!client || !trainingPackage) {
      return res.status(404).json({ message: 'Client or package not found' });
    }
    
    // Create client package
    const clientPackage = new ClientPackage({
      client: clientId,
      package: packageId,
      trainer: trainerId,
      purchaseDate: new Date()
    });
    
    await clientPackage.save();
    await clientPackage.populate(['client', 'package', 'trainer']);
    
    // Create invoice if requested
    if (createInvoice) {
      const invoice = new Invoice({
        client: clientId,
        clientPackage: clientPackage._id,
        items: [{
          description: trainingPackage.name,
          amount: trainingPackage.price,
          packageId: packageId
        }],
        totalAmount: trainingPackage.price,
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
        createdBy: req.user.id
      });
      
      await invoice.save();
    }
    
    res.status(201).json({ clientPackage });
  } catch (error) {
    console.error('Error assigning package:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Record a session
router.post('/record-session', auth, async (req, res) => {
  try {
    const { clientPackageId, sessionDate, notes, goals, achievements, homework } = req.body;
    
    // Find the client package
    const clientPackage = await ClientPackage.findById(clientPackageId)
      .populate('package')
      .populate('client');
    
    if (!clientPackage) {
      return res.status(404).json({ message: 'Client package not found' });
    }
    
    // Check if package is completed
    if (clientPackage.sessionsUsed >= clientPackage.package.sessions) {
      return res.status(400).json({ message: 'Package already completed' });
    }
    
    // Create session record
    const session = new Session({
      clientPackage: clientPackageId,
      client: clientPackage.client._id,
      trainer: clientPackage.trainer || req.user.id,
      sessionDate: sessionDate || new Date(),
      notes,
      goals,
      achievements,
      homework,
      recordedBy: req.user.id
    });
    
    await session.save();
    
    // Update client package
    clientPackage.sessionsUsed += 1;
    clientPackage.lastSessionDate = session.sessionDate;
    
    // Calculate next session date (1 week from now)
    if (clientPackage.sessionsUsed < clientPackage.package.sessions) {
      clientPackage.nextSessionDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    } else {
      clientPackage.status = 'completed';
      clientPackage.nextSessionDate = null;
    }
    
    await clientPackage.save();
    await clientPackage.populate(['client', 'package', 'trainer']);
    
    res.json({ session, clientPackage });
  } catch (error) {
    console.error('Error recording session:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// ======================
// INVOICE ROUTES
// ======================

// Get invoices
router.get('/invoices', auth, async (req, res) => {
  try {
    const { clientId, status } = req.query;
    let query = {};
    
    if (clientId) query.client = clientId;
    if (status) query.status = status;
    
    const invoices = await Invoice.find(query)
      .populate('client', 'firstName lastName email')
      .populate('clientPackage')
      .sort({ createdAt: -1 });
    
    res.json({ invoices });
  } catch (error) {
    console.error('Error fetching invoices:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create invoice
router.post('/invoices', auth, adminAuth, async (req, res) => {
  try {
    const { clientId, items, dueDate, clientPackageId } = req.body;
    
    const totalAmount = items.reduce((sum, item) => sum + item.amount, 0);
    
    const invoice = new Invoice({
      client: clientId,
      clientPackage: clientPackageId,
      items,
      totalAmount,
      dueDate: new Date(dueDate),
      createdBy: req.user.id
    });
    
    await invoice.save();
    await invoice.populate('client', 'firstName lastName email');
    
    res.status(201).json({ invoice });
  } catch (error) {
    console.error('Error creating invoice:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Mark invoice as paid
router.put('/invoices/:id/mark-paid', auth, adminAuth, async (req, res) => {
  try {
    const { paymentMethod } = req.body;
    
    const invoice = await Invoice.findByIdAndUpdate(
      req.params.id,
      {
        status: 'paid',
        paidDate: new Date(),
        paymentMethod: paymentMethod || 'card'
      },
      { new: true }
    ).populate('client', 'firstName lastName email');
    
    if (!invoice) {
      return res.status(404).json({ message: 'Invoice not found' });
    }
    
    res.json({ invoice });
  } catch (error) {
    console.error('Error marking invoice as paid:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// ======================
// CLIENT BILLING DATA (for admin dashboard)
// ======================

// Get billing data for a specific client
router.get('/client/:clientId/billing', auth, async (req, res) => {
  try {
    const clientId = req.params.clientId;
    
    // Get client packages
    const clientPackages = await ClientPackage.find({ client: clientId })
      .populate('package')
      .populate('trainer', 'firstName lastName')
      .sort({ createdAt: -1 });
    
    // Get client invoices
    const invoices = await Invoice.find({ client: clientId })
      .sort({ createdAt: -1 });
    
    // Get recent sessions
    const sessions = await Session.find({ client: clientId })
      .populate('trainer', 'firstName lastName')
      .sort({ sessionDate: -1 })
      .limit(10);
    
    res.json({
      clientPackages,
      invoices,
      sessions
    });
  } catch (error) {
    console.error('Error fetching client billing data:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;