const mongoose = require('mongoose');

const ProgressSchema = new mongoose.Schema({
  candidate: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Candidate', 
    required: true 
  },
  project: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Project', 
    required: true 
  },
  githubLink: { 
    type: String, 
    required: true 
  },
  completionPercentage: { 
    type: Number, 
    default: 0,
    min: 0,
    max: 100 
  },
  status: { 
    type: String, 
    enum: ['In Progress', 'Completed', 'Abandoned'], 
    default: 'In Progress' 
  },
  adminFeedback: { 
    type: String, 
    default: null 
  },
  pointsEarned: { 
    type: Number, 
    default: 0 
  }
}, { timestamps: true });

const Progress = mongoose.model('Progress', ProgressSchema);

module.exports = { Progress };