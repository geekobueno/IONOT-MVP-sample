const mongoose = require('mongoose');

const SubmissionSchema = new mongoose.Schema({
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true
  },
  candidate: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Candidate',
    required: true
  },
  githubLink: {
    type: String,
    required: true,
    trim: true,
    validate: {
      validator: function (v) {
        // Basic GitHub URL validation
        const githubUrlPattern = /^https:\/\/github\.com\/[\w-]+\/[\w-]+$/;
        return githubUrlPattern.test(v);
      },
      message: 'Please provide a valid GitHub repository URL'
    }
  },
  status: {
    type: String,
    enum: ['pending', 'in-review', 'accepted', 'rejected'],
    default: 'pending'
  },
  score: {
    type: Number,
    min: 0,
    max: 100,
    default: null
  },
  adminFeedback: {
    type: String,
    trim: true,
    default: null
  },
  submittedAt: {
    type: Date,
    default: Date.now
  },
  reviewedAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

// Create index to prevent duplicate submissions for the same project by a candidate
SubmissionSchema.index({ project: 1, candidate: 1 }, { unique: true });

module.exports = mongoose.models.Submission || mongoose.model('Submission', SubmissionSchema);
