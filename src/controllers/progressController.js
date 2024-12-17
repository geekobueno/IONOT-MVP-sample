const Progress = require('../models/Progress');
const Project = require('../models/Project');

// Get progress for a specific candidate
exports.getCandidateProgress = async (req, res) => {
  const { candidateId } = req.params;

  try {
    const progresses = await Progress.find({ candidate: candidateId })
      .populate('project')
      .sort({ createdAt: -1 });

    res.status(200).json(progresses);
  } catch (error) {
    res.status(500).json({ 
      message: 'Error fetching progress', 
      error: error.message 
    });
  }
};

// Update progress for a specific project
exports.updateProgress = async (req, res) => {
  const { progressId } = req.params;
  const { percentComplete, score } = req.body;

  try {
    const progress = await Progress.findByIdAndUpdate(
      progressId, 
      { 
        percentComplete, 
        score 
      }, 
      { new: true }
    ).populate('project');

    if (!progress) {
      return res.status(404).json({ message: 'Progress record not found' });
    }

    // Update project status if completed
    if (percentComplete === 100) {
      await Project.findByIdAndUpdate(
        progress.project._id, 
        { status: 'Completed' }
      );
    }

    res.status(200).json(progress);
  } catch (error) {
    res.status(500).json({ 
      message: 'Error updating progress', 
      error: error.message 
    });
  }
};