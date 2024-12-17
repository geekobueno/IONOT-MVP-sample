const express = require('express');
const { Project } = require('../models/Project');
const { Progress } = require('../models/Progress');
const { candidateAuth, adminAuth } = require('../middleware/authMiddleware');

const router = express.Router();

// Get Available Projects
router.get('/available', candidateAuth, async (req, res) => {
  try {
    // Exclude projects already assigned to the candidate or to others
    const availableProjects = await Project.find({
      status: 'Available',
      $or: [
        { assignedCandidate: null },
        { assignedCandidate: { $exists: false } }
      ]
    });

    res.json(availableProjects);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Accept Project
router.post('/accept', candidateAuth, async (req, res) => {
  const session = await mongoose.startSession();
  
  try {
    session.startTransaction();

    const { projectId, githubLink } = req.body;

    // Check if candidate already has a current project
    if (req.user.currentProject) {
      return res.status(400).json({ 
        error: 'You already have an active project. Complete or resign from it first.' 
      });
    }

    // Find the project
    const project = await Project.findById(projectId).session(session);
    
    if (!project || project.status !== 'Available') {
      throw new Error('Project not available');
    }

    // Update project
    project.status = 'In Progress';
    project.assignedCandidate = req.user._id;
    await project.save({ session });

    // Update candidate
    req.user.currentProject = projectId;
    req.user.githubLink = githubLink;
    await req.user.save({ session });

    // Create progress entry
    const progress = new Progress({
      candidate: req.user._id,
      project: projectId,
      githubLink,
      status: 'In Progress'
    });
    await progress.save({ session });

    await session.commitTransaction();
    session.endSession();

    res.status(201).json({ 
      project, 
      progress,
      message: 'Project successfully accepted' 
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    res.status(400).json({ error: error.message });
  }
});

// Resign from Project
router.post('/resign', candidateAuth, async (req, res) => {
  const session = await mongoose.startSession();
  
  try {
    session.startTransaction();

    const { projectId } = req.body;

    // Verify the project is actually the candidate's current project
    if (req.user.currentProject.toString() !== projectId) {
      return res.status(400).json({ 
        error: 'This is not your current project' 
      });
    }

    // Find the project
    const project = await Project.findById(projectId).session(session);
    
    if (!project) {
      throw new Error('Project not found');
    }

    // Penalty for resigning
    req.user.points = Math.max(0, req.user.points - 20);
    req.user.currentProject = null;
    await req.user.save({ session });

    // Update project
    project.status = 'Available';
    project.assignedCandidate = null;
    await project.save({ session });

    // Update progress
    const progress = await Progress.findOneAndUpdate(
      { 
        candidate: req.user._id, 
        project: projectId 
      },
      { 
        status: 'Abandoned',
        completionPercentage: 0
      },
      { session, new: true }
    );

    await session.commitTransaction();
    session.endSession();

    res.json({ 
      message: 'Project resigned successfully',
      pointsDeducted: 20
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    res.status(400).json({ error: error.message });
  }
});

// Admin: Create New Project
router.post('/', adminAuth, async (req, res) => {
  try {
    const { 
      title, 
      description, 
      difficultyLevel, 
      pointsWorth,
      requiredSkills 
    } = req.body;

    const project = new Project({
      title,
      description,
      difficultyLevel,
      pointsWorth,
      requiredSkills,
      status: 'Available'
    });

    await project.save();

    res.status(201).json(project);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Admin: Update Project
router.patch('/:id', adminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const project = await Project.findByIdAndUpdate(
      id, 
      updateData, 
      { 
        new: true, 
        runValidators: true 
      }
    );

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    res.json(project);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Admin: Delete Project
router.delete('/:id', adminAuth, async (req, res) => {
  try {
    const { id } = req.params;

    // Check if project is in progress
    const existingProject = await Project.findById(id);
    if (existingProject.status === 'In Progress') {
      return res.status(400).json({ 
        error: 'Cannot delete project currently in progress' 
      });
    }

    const project = await Project.findByIdAndDelete(id);

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    res.json({ 
      message: 'Project deleted successfully',
      deletedProject: project 
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get Project Details
router.get('/:id', candidateAuth, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    res.json(project);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;