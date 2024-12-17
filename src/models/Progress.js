const mongoose = require('mongoose');

const progressSchema = new mongoose.Schema({
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
  percentComplete: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  score: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  }
}, { timestamps: true });

module.exports = mongoose.model('Progress', progressSchema);