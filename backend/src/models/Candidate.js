const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const CandidateSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true 
  },
  email: { 
    type: String, 
    required: true, 
    unique: true 
  },
  password: { 
    type: String, 
    required: true 
  },
  currentProject: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Project',
    default: null 
  },
  completedProjects: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Project' 
  }],
  points: { 
    type: Number, 
    default: 0 
  },
  githubLink: { 
    type: String, 
    default: null 
  }
}, { timestamps: true });

// Hash password before saving
CandidateSchema.pre('save', async function(next) {
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});

const Candidate = mongoose.model('Candidate', CandidateSchema);

module.exports = { Candidate };