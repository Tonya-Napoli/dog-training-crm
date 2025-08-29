// src/api/routes/inviteRoutes.js
import express from 'express';
import { InviteController } from '../controllers/inviteController.js';
import { auth, adminAuth } from '../middleware/auth.js';

const router = express.Router();
const inviteController = new InviteController();

// @route   POST /api/invites/trainer
// @desc    Send trainer invitation
// @access  Admin only
router.post('/trainer', adminAuth, (req, res) => 
  inviteController.sendTrainerInvite(req, res)
);

// @route   GET /api/invites/validate/:token
// @desc    Validate invite token
// @access  Public
router.get('/validate/:token', (req, res) => 
  inviteController.validateInvite(req, res)
);

// @route   POST /api/invites/accept/:token
// @desc    Accept trainer invitation and complete registration
// @access  Public
router.post('/accept/:token', (req, res) => 
  inviteController.acceptInvite(req, res)
);

// @route   GET /api/invites/pending
// @desc    Get all pending invites
// @access  Admin only
router.get('/pending', adminAuth, async (req, res) => {
  try {
    const { InviteModel } = await import('../models/Invite.js');
    const pendingInvites = await InviteModel.find({ status: 'pending' })
      .populate('createdBy', 'firstName lastName email')
      .sort({ createdAt: -1 });
    
    res.json({ success: true, invites: pendingInvites });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch invites' });
  }
});

export default router;