import express from 'express';
import { InviteController } from '../controllers/inviteController.js';
import { adminAuth } from '../middleware/auth.js';

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

export default router;