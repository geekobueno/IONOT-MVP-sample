const express = require('express');
const router = express.Router();
const { 
  getAllProjects, 
  acceptProject 
} = require('../controllers/projectController');

// GET all available projects
router.get('/', getAllProjects);

// POST accept a project
router.post('/accept', acceptProject);

module.exports = router;