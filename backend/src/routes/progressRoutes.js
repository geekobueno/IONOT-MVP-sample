const express = require('express');
const { Progress } = require('../models/Progress');
const { candidateAuth, adminAuth } = require('../middleware/authMiddleware');
const mongoose = require('mongoose');

const router = express.Router();

// Update Progress (by Candidate)
router.patch('/update', candidateAuth, async (req, res) => {
  const session = await mongoose.startSession();
  
  try {
    session.startTransaction();

    const { 
      completionPercentage, 
      githubLink, 
      additionalDetails 
    } = req.body;

    // Validate completion percentage
    if (completionPercentage < 0 || completionPercentage > 100) {
      return res.status(400).json({ 
        error: 'Completion percentage must be between 0 and 100' 
      });
    }

    // Find the current progress
    const progress = await Progress.findOne({
      candidate: req.user._id,
      project: req.user.currentProject
    }).session(session);

    if (!progress) {
      throw new Error('No active project progress found');
    }

    // Update progress
    progress.completionPercentage = completionPercentage;
    progress.githubLink = githubLink;
    progress.additionalDetails = additionalDetails || progress.additionalDetails;
    
    // Auto-complete if 100%
    if (completionPercentage === 100) {
      progress.status = 'Completed';
    }

    await progress.save({ session });

    // Optionally update candidate's github link
    req.user.githubLink = githubLink;
    await req.user.save({ session });

    await session.commitTransaction();
    session.endSession();

    res.json(progress);
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    res.status(400).json({ error: error.message });
  }
});

// Admin: Get All Progress Entries
router.get('/admin/all', adminAuth, async (req, res) => {
  try {
    const { 
      status, 
      minCompletionPercentage, 
      maxCompletionPercentage 
    } = req.query;

    // Build filter
    const filter = {};
    if (status) filter.status = status;
    if (minCompletionPercentage) {
      filter.completionPercentage = { 
        $gte: parseFloat(minCompletionPercentage) 
      };
    }
    if (maxCompletionPercentage) {
      filter.completionPercentage = { 
        ...filter.completionPercentage,
        $lte: parseFloat(maxCompletionPercentage) 
      };
    }

    const progresses = await Progress.find(filter)
      .populate('candidate', 'name email')
      .populate('project', 'title description');

    res.json(progresses);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Admin: Score and Review Progress
router.patch('/admin/score/:progressId', adminAuth, async (req, res) => {
  const session = await mongoose.startSession();
  
  try {
    session.startTransaction();

    const { progressId } = req.params;
    const { 
      pointsEarned, 
      status, 
      adminFeedback,
      difficultyRating
    } = req.body;

    // Find progress entry
    const progress = await Progress.findById(progressId)
      .populate('candidate')
      .populate('project')
      .session(session);

    if (!progress) {
      return res.status(404).json({ error: 'Progress not found' });
    }

    // Update progress
    progress.pointsEarned = pointsEarned;
    progress.status = status;
    progress.adminFeedback = adminFeedback;
    progress.difficultyRating = difficultyRating;

    await progress.save({ session });

    // Update candidate points and completed projects
    const candidate = progress.candidate;
    candidate.points += pointsEarned;
    
    if (status === 'Completed') {
      candidate.completedProjects.push(progress.project._id);
      candidate.currentProject = null;
    }

    await candidate.save({ session });

    // Update project status
    const project = progress.project;
    if (status === 'Completed') {
      project.status = 'Completed';
      project.assignedCandidate = null;
    }

    await project.save({ session });

    await session.commitTransaction();
    session.endSession();

    res.json({ 
      progress, 
      message: 'Progress successfully scored' 
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    res.status(400).json({ error: error.message });
  }
});

// Get Candidate's Progress History
router.get('/history', candidateAuth, async (req, res) => {
  try {
    const progresses = await Progress.find({ 
      candidate: req.user._id 
    })
    .populate('project', 'title description')
    .sort({ createdAt: -1 });

    res.json(progresses);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get Single Progress Details
router.get('/:progressId', candidateAuth, async (req, res) => {
  try {
    const progress = await Progress.findOne({
      _id: req.params.progressId,
      candidate: req.user._id
    })
    .populate('project');

    if (!progress) {
      return res.status(404).json({ error: 'Progress not found' });
    }

    res.json(progress);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;