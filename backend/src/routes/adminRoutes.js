const express = require('express');
const { Candidate } = require('../models/Candidate');
const { Progress } = require('../models/Progress');
const { Project } = require('../models/Project');
const { adminAuth } = require('../middleware/authMiddleware');

const router = express.Router();

// Get All Candidates
router.get('/candidates', adminAuth, async (req, res) => {
  try {
    const candidates = await Candidate.find()
      .select('-password')
      .populate('currentProject')
      .populate('completedProjects');
    
    res.json(candidates);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get Candidate Performance
router.get('/candidates/performance', adminAuth, async (req, res) => {
  try {
    const candidatePerformance = await Candidate.aggregate([
      {
        $lookup: {
          from: 'progresses',
          localField: '_id',
          foreignField: 'candidate',
          as: 'projectProgress'
        }
      },
      {
        $project: {
          name: 1,
          email: 1,
          points: 1,
          completedProjects: { $size: '$completedProjects' },
          averageCompletion: { 
            $avg: '$projectProgress.completionPercentage' 
          }
        }
      },
      { $sort: { points: -1 } }
    ]);

    res.json(candidatePerformance);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create New Project
router.post('/projects', adminAuth, async (req, res) => {
  try {
    const { title, description, difficultyLevel, pointsWorth } = req.body;
    
    const project = new Project({
      title,
      description,
      difficultyLevel,
      pointsWorth
    });

    await project.save();
    res.status(201).json(project);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Update Project
router.patch('/projects/:id', adminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const project = await Project.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true
    });

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    res.json(project);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get All Projects with Detailed Progress
router.get('/projects', adminAuth, async (req, res) => {
  try {
    const projects = await Project.aggregate([
      {
        $lookup: {
          from: 'progresses',
          localField: '_id',
          foreignField: 'project',
          as: 'projectProgress'
        }
      },
      {
        $addFields: {
          activeProgressCount: { $size: '$projectProgress' },
          averageCompletion: { $avg: '$projectProgress.completionPercentage' }
        }
      }
    ]);

    res.json(projects);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Review and Score Progress
router.patch('/progress/:progressId/score', adminAuth, async (req, res) => {
  try {
    const { progressId } = req.params;
    const { pointsEarned, status, adminFeedback } = req.body;

    const progress = await Progress.findByIdAndUpdate(
      progressId, 
      { 
        pointsEarned, 
        status, 
        adminFeedback 
      },
      { new: true }
    ).populate('candidate').populate('project');

    if (!progress) {
      return res.status(404).json({ error: 'Progress not found' });
    }

    // Update candidate points if project completed
    if (status === 'Completed') {
      await Candidate.findByIdAndUpdate(progress.candidate._id, {
        $inc: { points: pointsEarned },
        $push: { completedProjects: progress.project._id }
      });
    }

    res.json(progress);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;