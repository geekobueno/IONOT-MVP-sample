const mongoose = require('mongoose');

const ProjectSchema = new mongoose.Schema({
  title: { 
    type: String, 
    required: true 
  },
  description: { 
    type: String, 
    required: true 
  },
  difficultyLevel: { 
    type: String, 
    enum: ['Beginner', 'Intermediate', 'Advanced'], 
    default: 'Beginner' 
  },
  status: { 
    type: String, 
    enum: ['Available', 'In Progress', 'Completed'], 
    default: 'Available' 
  },
  assignedCandidate: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Candidate',
    default: null 
  },
  pointsWorth: { 
    type: Number, 
    default: 0 
  }
}, { timestamps: true });

const Project = mongoose.model('Project', ProjectSchema);

module.exports = { Project };