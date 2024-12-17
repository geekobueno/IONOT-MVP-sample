// src/controllers/projectController.js
const Project = require('../models/Project');
const Candidate = require('../models/Candidate');
const Progress = require('../models/Progress');

// Get all available projects
exports.getAllProjects = async (req, res) => {
  try {
    const projects = await Project.find({ 
      $or: [
        { status: 'Pending' },
        { assignedTo: null }
      ]
    });
    res.status(200).json(projects);
  } catch (error) {
    res.status(500).json({ 
      message: 'Error fetching projects', 
      error: error.message 
    });
  }
};

// Accept a project
exports.acceptProject = async (req, res) => {
  const { projectId, candidateId } = req.body;

  try {
    // Find the project
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Check if project is already assigned
    if (project.assignedTo) {
      return res.status(400).json({ message: 'Project already assigned' });
    }

    // Update project status
    project.status = 'Assigned';
    project.assignedTo = candidateId;
    await project.save();

    // Create progress record
    const progress = await Progress.create({
      candidate: candidateId,
      project: projectId,
      percentComplete: 0,
      score: 0
    });

    res.status(200).json({ 
      message: 'Project accepted successfully', 
      project, 
      progress 
    });
  } catch (error) {
    res.status(500).json({ 
      message: 'Error accepting project', 
      error: error.message 
    });
  }
};