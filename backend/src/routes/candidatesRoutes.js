const express = require('express');
const { Candidate } = require('../models/Candidate');
const { Project } = require('../models/Project');
const { Progress } = require('../models/Progress');
const { candidateAuth } = require('../middleware/authMiddleware');

const router = express.Router();

// Get Candidate Profile
router.get('/profile', candidateAuth, async (req, res) => {
  try {
    const candidate = await Candidate.findById(req.user.id)
      .select('-password')
      .populate('currentProject')
      .populate('completedProjects');
    
    res.json(candidate);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get Candidate's Current Project
router.get('/current-project', candidateAuth, async (req, res) => {
  try {
    const project = await Project.findById(req.user.currentProject);
    
    if (!project) {
      return res.status(404).json({ message: 'No current project' });
    }

    const progress = await Progress.findOne({
      candidate: req.user.id,
      project: project._id
    });

    res.json({ project, progress });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get Candidate's Completed Projects
router.get('/completed-projects', candidateAuth, async (req, res) => {
  try {
    const completedProjects = await Project.find({
      _id: { $in: req.user.completedProjects }
    });
    
    res.json(completedProjects);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update Candidate Profile
router.patch('/profile', candidateAuth, async (req, res) => {
  try {
    const { name, email } = req.body;
    
    const candidate = await Candidate.findByIdAndUpdate(
      req.user.id, 
      { name, email },
      { new: true, runValidators: true }
    ).select('-password');

    res.json(candidate);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get Candidate Scoreboard
router.get('/scoreboard', candidateAuth, async (req, res) => {
  try {
    const scoreboard = await Candidate.find()
      .sort({ points: -1 })
      .select('name points completedProjects')
      .limit(10);
    
    res.json(scoreboard);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;