const express = require('express');
const router = express.Router();
const { 
  getCandidateProgress, 
  updateProgress 
} = require('../controllers/progressController');

// GET progress for a candidate
router.get('/:candidateId', getCandidateProgress);

// UPDATE progress for a specific progress record
router.patch('/:progressId', updateProgress);

module.exports = router;