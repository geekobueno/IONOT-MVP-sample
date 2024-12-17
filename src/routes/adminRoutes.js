const express = require('express');
const router = express.Router();
const {
  getDashboardStats,
  getAllProjectsWithDetails,
  getCandidatePerformanceDetails,
  createProject
} = require('../controllers/adminController');

// GET dashboard statistics
router.get('/dashboard', getDashboardStats);

// GET all projects with detailed information
router.get('/projects', getAllProjectsWithDetails);

// GET candidate performance details
router.get('/candidates/performance', getCandidatePerformanceDetails);

// POST create a new project
router.post('/projects', createProject);

module.exports = router;