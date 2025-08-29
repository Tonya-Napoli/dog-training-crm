import express from 'express';
import { InviteController } from '../controllers/inviteController.js';
import { adminAuth } from '../middleware/auth.js'; // Removed unused 'auth' import

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
    // TODO: Implement when Invite model is created
    res.json({ success: true, invites: [] });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch invites' });
  }
});

export default router;