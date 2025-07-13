import express from 'express';
import mongoose from 'mongoose';
import Session from '../models/Session.js';
import ClientPackage from '../models/ClientPackage.js';
import User from '../models/User.js';
import auth from '../middleware/auth.js';
import adminAuth from '../middleware/adminAuth.js';

const router = express.Router();

// Validate ObjectId helper
const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

// Get sessions for a client
router.get('/client/:clientId', auth, async (req, res) => {
  try {
    const { clientId } = req.params;
    
    // Validate ObjectId
    if (!isValidObjectId(clientId)) {
      return res.status(400).json({ message: 'Invalid client ID' });
    }

    // Check authorization
    if (req.user.role === 'client' && req.user.id !== clientId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const { status, limit = 10 } = req.query;
    let query = { client: new mongoose.Types.ObjectId(clientId) };
    
    if (status) query.status = status;

    const sessions = await Session.find(query)
      .populate('trainer', 'firstName lastName email phone specialties')
      .populate('clientPackage', 'packageName sessionsRemaining totalSessions')
      .sort({ sessionDate: -1 })
      .limit(parseInt(limit))
      .lean(); // Use lean() for better performance when only reading

    res.json({ sessions });
  } catch (err) {
    console.error('Error fetching client sessions:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get sessions for a trainer
router.get('/trainer/:trainerId', auth, async (req, res) => {
  try {
    const { trainerId } = req.params;
    
    // Validate ObjectId
    if (!isValidObjectId(trainerId)) {
      return res.status(400).json({ message: 'Invalid trainer ID' });
    }

    // Check authorization
    if (req.user.role === 'trainer' && req.user.id !== trainerId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const { date, status } = req.query;
    let query = { trainer: new mongoose.Types.ObjectId(trainerId) };
    
    if (status) query.status = status;
    if (date) {
      const startOfDay = new Date(date);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);
      query.sessionDate = { 
        $gte: startOfDay, 
        $lte: endOfDay 
      };
    }

    const sessions = await Session.find(query)
      .populate('client', 'firstName lastName dogName dogBreed email phone')
      .populate('clientPackage', 'packageName sessionsRemaining')
      .sort({ sessionDate: 1, scheduledTime: 1 })
      .lean();

    res.json({ sessions });
  } catch (err) {
    console.error('Error fetching trainer sessions:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all sessions (admin only)
router.get('/', adminAuth, async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      status, 
      trainer, 
      client, 
      sessionType,
      startDate,
      endDate 
    } = req.query;

    let query = {};
    
    // Add filters with proper ObjectId conversion
    if (status) query.status = status;
    if (trainer && isValidObjectId(trainer)) {
      query.trainer = new mongoose.Types.ObjectId(trainer);
    }
    if (client && isValidObjectId(client)) {
      query.client = new mongoose.Types.ObjectId(client);
    }
    if (sessionType) query.sessionType = sessionType;
    
    // Date range filter
    if (startDate || endDate) {
      query.sessionDate = {};
      if (startDate) query.sessionDate.$gte = new Date(startDate);
      if (endDate) query.sessionDate.$lte = new Date(endDate);
    }

    const sessions = await Session.find(query)
      .populate('client', 'firstName lastName email phone dogName')
      .populate('trainer', 'firstName lastName email phone')
      .populate('clientPackage', 'packageName')
      .sort({ sessionDate: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit))
      .lean();

    const total = await Session.countDocuments(query);

    res.json({
      sessions,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
        limit: parseInt(limit)
      }
    });
  } catch (err) {
    console.error('Error fetching sessions:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get specific session by ID
router.get('/:sessionId', auth, async (req, res) => {
  try {
    const { sessionId } = req.params;
    
    if (!isValidObjectId(sessionId)) {
      return res.status(400).json({ message: 'Invalid session ID' });
    }

    const session = await Session.findById(sessionId)
      .populate('client', 'firstName lastName email phone dogName dogBreed dogAge')
      .populate('trainer', 'firstName lastName email phone specialties')
      .populate('clientPackage', 'packageName sessionsRemaining totalSessions')
      .lean();

    if (!session) {
      return res.status(404).json({ message: 'Session not found' });
    }

    // Check authorization
    const canView = req.user.role === 'admin' || 
                   req.user.id === session.client._id.toString() || 
                   req.user.id === session.trainer._id.toString();

    if (!canView) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json({ session });
  } catch (err) {
    console.error('Error fetching session:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create new session
router.post('/', auth, async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const {
      clientPackageId,
      clientId,
      trainerId,
      sessionDate,
      scheduledTime,
      sessionType,
      duration,
      notes
    } = req.body;

    // Validate ObjectIds
    if (!isValidObjectId(clientPackageId) || !isValidObjectId(clientId) || !isValidObjectId(trainerId)) {
      return res.status(400).json({ message: 'Invalid ID format' });
    }

    // Verify the package exists and has sessions remaining
    const clientPackage = await ClientPackage.findById(clientPackageId).session(session);
    if (!clientPackage) {
      await session.abortTransaction();
      return res.status(404).json({ message: 'Package not found' });
    }
    
    if (clientPackage.sessionsRemaining <= 0) {
      await session.abortTransaction();
      return res.status(400).json({ message: 'No sessions remaining in package' });
    }

    // Verify client exists
    const client = await User.findOne({ 
      _id: new mongoose.Types.ObjectId(clientId), 
      role: 'client' 
    }).session(session);
    
    if (!client) {
      await session.abortTransaction();
      return res.status(404).json({ message: 'Client not found' });
    }

    // Verify trainer exists and is active
    const trainer = await User.findOne({ 
      _id: new mongoose.Types.ObjectId(trainerId), 
      role: 'trainer', 
      isActive: true 
    }).session(session);
    
    if (!trainer) {
      await session.abortTransaction();
      return res.status(404).json({ message: 'Trainer not found or inactive' });
    }

    // Check for scheduling conflicts
    const conflictingSession = await Session.findOne({
      trainer: new mongoose.Types.ObjectId(trainerId),
      sessionDate: new Date(sessionDate),
      scheduledTime,
      status: { $in: ['scheduled', 'confirmed', 'in-progress'] }
    }).session(session);

    if (conflictingSession) {
      await session.abortTransaction();
      return res.status(400).json({ message: 'Trainer has a conflicting session at this time' });
    }

    // Create the session
    const newSession = new Session({
      clientPackage: new mongoose.Types.ObjectId(clientPackageId),
      client: new mongoose.Types.ObjectId(clientId),
      trainer: new mongoose.Types.ObjectId(trainerId),
      sessionDate: new Date(sessionDate),
      scheduledTime,
      sessionType: sessionType || 'individual',
      duration: duration || 60,
      notes: notes || '',
      status: 'scheduled',
      recordedBy: new mongoose.Types.ObjectId(req.user.id)
    });

    await newSession.save({ session });
    
    // Decrement package sessions
    clientPackage.sessionsRemaining -= 1;
    await clientPackage.save({ session });

    await session.commitTransaction();

    // Populate for response (outside transaction)
    await newSession.populate([
      { path: 'client', select: 'firstName lastName email phone' },
      { path: 'trainer', select: 'firstName lastName email phone' },
      { path: 'clientPackage', select: 'packageName sessionsRemaining' }
    ]);

    res.status(201).json({
      message: 'Session created successfully',
      session: newSession
    });
  } catch (err) {
    await session.abortTransaction();
    console.error('Error creating session:', err);
    res.status(500).json({ message: 'Server error' });
  } finally {
    session.endSession();
  }
});

// Update session
router.put('/:sessionId', auth, async (req, res) => {
  try {
    const { sessionId } = req.params;
    
    if (!isValidObjectId(sessionId)) {
      return res.status(400).json({ message: 'Invalid session ID' });
    }

    const sessionDoc = await Session.findById(sessionId);
    
    if (!sessionDoc) {
      return res.status(404).json({ message: 'Session not found' });
    }

    // Check authorization
    const canEdit = req.user.role === 'admin' || 
                   req.user.id === sessionDoc.trainer.toString() ||
                   (req.user.role === 'client' && req.user.id === sessionDoc.client.toString());

    if (!canEdit) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Update allowed fields
    const allowedUpdates = [
      'notes', 'goals', 'achievements', 'homework', 'nextSessionGoals',
      'progressRating', 'dogBehaviorNotes', 'clientEngagement', 'status',
      'actualStartTime', 'actualEndTime', 'scheduledTime', 'sessionDate'
    ];

    const updateFields = {};
    allowedUpdates.forEach(field => {
      if (req.body[field] !== undefined) {
        updateFields[field] = req.body[field];
      }
    });

    // Handle date fields properly
    if (updateFields.sessionDate) {
      updateFields.sessionDate = new Date(updateFields.sessionDate);
    }
    if (updateFields.actualStartTime) {
      updateFields.actualStartTime = new Date(updateFields.actualStartTime);
    }
    if (updateFields.actualEndTime) {
      updateFields.actualEndTime = new Date(updateFields.actualEndTime);
    }

    const updatedSession = await Session.findByIdAndUpdate(
      sessionId,
      updateFields,
      { new: true, runValidators: true }
    ).populate([
      { path: 'client', select: 'firstName lastName email phone' },
      { path: 'trainer', select: 'firstName lastName email phone' },
      { path: 'clientPackage', select: 'packageName sessionsRemaining' }
    ]);

    res.json({
      message: 'Session updated successfully',
      session: updatedSession
    });
  } catch (err) {
    console.error('Error updating session:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Mark session as completed
router.put('/:sessionId/complete', auth, async (req, res) => {
  try {
    const { sessionId } = req.params;
    
    if (!isValidObjectId(sessionId)) {
      return res.status(400).json({ message: 'Invalid session ID' });
    }

    const sessionDoc = await Session.findById(sessionId);
    
    if (!sessionDoc) {
      return res.status(404).json({ message: 'Session not found' });
    }

    // Only trainer or admin can mark as completed
    if (req.user.id !== sessionDoc.trainer.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Only the assigned trainer can complete sessions' });
    }

    const { notes, progressRating, goals, achievements, homework, nextSessionGoals } = req.body;

    const updateFields = {
      status: 'completed',
      actualEndTime: new Date()
    };

    if (notes) updateFields.notes = notes;
    if (progressRating) updateFields.progressRating = progressRating;
    if (goals) updateFields.goals = goals;
    if (achievements) updateFields.achievements = achievements;
    if (homework) updateFields.homework = homework;
    if (nextSessionGoals) updateFields.nextSessionGoals = nextSessionGoals;

    const completedSession = await Session.findByIdAndUpdate(
      sessionId,
      updateFields,
      { new: true, runValidators: true }
    ).populate([
      { path: 'client', select: 'firstName lastName email phone' },
      { path: 'trainer', select: 'firstName lastName email phone' },
      { path: 'clientPackage', select: 'packageName sessionsRemaining' }
    ]);

    res.json({
      message: 'Session completed successfully',
      session: completedSession
    });
  } catch (err) {
    console.error('Error completing session:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Cancel session
router.delete('/:sessionId', auth, async (req, res) => {
  const mongoSession = await mongoose.startSession();
  mongoSession.startTransaction();

  try {
    const { sessionId } = req.params;
    
    if (!isValidObjectId(sessionId)) {
      return res.status(400).json({ message: 'Invalid session ID' });
    }

    const sessionDoc = await Session.findById(sessionId).session(mongoSession);
    
    if (!sessionDoc) {
      await mongoSession.abortTransaction();
      return res.status(404).json({ message: 'Session not found' });
    }

    const { reason, refundSession = false } = req.body;

    // Update session status
    sessionDoc.status = 'cancelled';
    sessionDoc.cancellationReason = reason || 'No reason provided';
    await sessionDoc.save({ session: mongoSession });

    // If refunding the session, add it back to the package
    if (refundSession && sessionDoc.clientPackage) {
      await ClientPackage.findByIdAndUpdate(
        sessionDoc.clientPackage,
        { $inc: { sessionsRemaining: 1 } },
        { session: mongoSession }
      );
    }

    await mongoSession.commitTransaction();

    res.json({
      message: 'Session cancelled successfully',
      session: sessionDoc
    });
  } catch (err) {
    await mongoSession.abortTransaction();
    console.error('Error cancelling session:', err);
    res.status(500).json({ message: 'Server error' });
  } finally {
    mongoSession.endSession();
  }
});

// Session analytics (admin only)
router.get('/analytics/stats', adminAuth, async (req, res) => {
  try {
    const { startDate, endDate, trainerId } = req.query;
    
    let matchQuery = {};
    if (startDate || endDate) {
      matchQuery.sessionDate = {};
      if (startDate) matchQuery.sessionDate.$gte = new Date(startDate);
      if (endDate) matchQuery.sessionDate.$lte = new Date(endDate);
    }
    if (trainerId && isValidObjectId(trainerId)) {
      matchQuery.trainer = new mongoose.Types.ObjectId(trainerId);
    }

    const stats = await Session.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: null,
          totalSessions: { $sum: 1 },
          completedSessions: {
            $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
          },
          cancelledSessions: {
            $sum: { $cond: [{ $eq: ['$status', 'cancelled'] }, 1, 0] }
          },
          averageRating: { $avg: '$progressRating' },
          averageDuration: { $avg: '$duration' }
        }
      }
    ]);

    res.json({ stats: stats[0] || {} });
  } catch (err) {
    console.error('Error fetching session stats:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;