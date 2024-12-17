const Project = require('../models/Project');
const Candidate = require('../models/Candidate');
const Progress = require('../models/Progress');

// Get overall dashboard statistics
exports.getDashboardStats = async (req, res) => {
  try {
    const totalProjects = await Project.countDocuments();
    const pendingProjects = await Project.countDocuments({ status: 'Pending' });
    const inProgressProjects = await Project.countDocuments({ status: 'In Progress' });
    const completedProjects = await Project.countDocuments({ status: 'Completed' });

    const totalCandidates = await Candidate.countDocuments();
    
    const topPerformers = await Progress.aggregate([
      {
        $group: {
          _id: '$candidate',
          averageScore: { $avg: '$score' },
          completedProjects: { 
            $sum: { 
              $cond: [{ $eq: ['$percentComplete', 100] }, 1, 0] 
            } 
          }
        }
      },
      { $sort: { averageScore: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: 'candidates', // Assumes the collection name is 'candidates'
          localField: '_id',
          foreignField: '_id',
          as: 'candidateDetails'
        }
      },
      { $unwind: '$candidateDetails' }
    ]);

    res.status(200).json({
      projects: {
        total: totalProjects,
        pending: pendingProjects,
        inProgress: inProgressProjects,
        completed: completedProjects
      },
      candidates: {
        total: totalCandidates
      },
      topPerformers: topPerformers.map(performer => ({
        name: performer.candidateDetails.name,
        email: performer.candidateDetails.email,
        averageScore: performer.averageScore.toFixed(2),
        completedProjects: performer.completedProjects
      }))
    });
  } catch (error) {
    res.status(500).json({ 
      message: 'Error fetching dashboard statistics', 
      error: error.message 
    });
  }
};

// Get detailed project tracking
exports.getAllProjectsWithDetails = async (req, res) => {
  try {
    const projects = await Project.aggregate([
      {
        $lookup: {
          from: 'candidates', // Assumes the collection name is 'candidates'
          localField: 'assignedTo',
          foreignField: '_id',
          as: 'assignedCandidate'
        }
      },
      {
        $lookup: {
          from: 'progresses', // Assumes the collection name is 'progresses'
          localField: '_id',
          foreignField: 'project',
          as: 'progressDetails'
        }
      },
      {
        $unwind: { 
          path: '$assignedCandidate', 
          preserveNullAndEmptyArrays: true 
        }
      },
      {
        $unwind: { 
          path: '$progressDetails', 
          preserveNullAndEmptyArrays: true 
        }
      },
      {
        $project: {
          title: 1,
          description: 1,
          difficulty: 1,
          status: 1,
          assignedCandidate: {
            name: '$assignedCandidate.name',
            email: '$assignedCandidate.email'
          },
          progress: {
            percentComplete: '$progressDetails.percentComplete',
            score: '$progressDetails.score'
          }
        }
      }
    ]);

    res.status(200).json(projects);
  } catch (error) {
    res.status(500).json({ 
      message: 'Error fetching project details', 
      error: error.message 
    });
  }
};

// Get candidate performance details
exports.getCandidatePerformanceDetails = async (req, res) => {
  try {
    const candidatePerformance = await Candidate.aggregate([
      {
        $lookup: {
          from: 'progresses',
          localField: '_id',
          foreignField: 'candidate',
          as: 'progressDetails'
        }
      },
      {
        $addFields: {
          completedProjects: {
            $size: {
              $filter: {
                input: '$progressDetails',
                as: 'progress',
                cond: { $eq: ['$$progress.percentComplete', 100] }
              }
            }
          },
          averageScore: { $avg: '$progressDetails.score' }
        }
      },
      {
        $project: {
          name: 1,
          email: 1,
          completedProjects: 1,
          averageScore: { $ifNull: [{ $round: ['$averageScore', 2] }, 0] },
          totalAssignedProjects: { $size: '$progressDetails' }
        }
      },
      { $sort: { averageScore: -1 } }
    ]);

    res.status(200).json(candidatePerformance);
  } catch (error) {
    res.status(500).json({ 
      message: 'Error fetching candidate performance', 
      error: error.message 
    });
  }
};

// Create a new project
exports.createProject = async (req, res) => {
  try {
    const { title, description, difficulty } = req.body;
    
    const newProject = new Project({
      title,
      description,
      difficulty,
      status: 'Pending'
    });

    await newProject.save();

    res.status(201).json({
      message: 'Project created successfully',
      project: newProject
    });
  } catch (error) {
    res.status(500).json({ 
      message: 'Error creating project', 
      error: error.message 
    });
  }
};