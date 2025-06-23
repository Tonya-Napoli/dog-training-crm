// Create new file: src/api/models/TrainerNote.js
import mongoose from 'mongoose';

const trainerNoteSchema = new mongoose.Schema({
  trainer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  subject: {
    type: String,
    required: true,
    trim: true
  },
  content: {
    type: String,
    required: true
  },
  category: {
    type: String,
    enum: ['performance', 'client-feedback', 'incident', 'general', 'training', 'schedule'],
    default: 'general'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const TrainerNote = mongoose.model('TrainerNote', trainerNoteSchema);

export default TrainerNote;