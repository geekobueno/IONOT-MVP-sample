const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { Candidate } = require('../models/Candidate');
const { Admin } = require('../models/Admin');

const router = express.Router();

// Candidate Registration
router.post('/candidates/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    
    // Check if candidate already exists
    const existingCandidate = await Candidate.findOne({ email });
    if (existingCandidate) {
      return res.status(400).json({ error: 'Email already in use' });
    }

    // Create new candidate
    const candidate = new Candidate({ name, email, password });
    await candidate.save();

    // Generate token
    const token = jwt.sign(
      { id: candidate._id, type: 'candidate' }, 
      process.env.JWT_SECRET, 
      { expiresIn: '7d' }
    );

    res.status(201).json({ 
      candidate: { 
        id: candidate._id, 
        name: candidate.name, 
        email: candidate.email 
      }, 
      token 
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Candidate Login
router.post('/candidates/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Find candidate
    const candidate = await Candidate.findOne({ email });
    if (!candidate) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, candidate.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate token
    const token = jwt.sign(
      { id: candidate._id, type: 'candidate' }, 
      process.env.JWT_SECRET, 
      { expiresIn: '7d' }
    );

    res.json({ 
      candidate: { 
        id: candidate._id, 
        name: candidate.name, 
        email: candidate.email 
      }, 
      token 
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Admin Login
router.post('/admin/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    // Hardcoded admin credentials (replace with more secure method in production)
    const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin';
    const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'adminpassword';

    // Check credentials
    if (username !== ADMIN_USERNAME || password !== ADMIN_PASSWORD) {
      return res.status(401).json({ error: 'Invalid admin credentials' });
    }

    // Find or create admin
    let admin = await Admin.findOne({ username });
    if (!admin) {
      admin = new Admin({ username });
      await admin.save();
    }

    // Generate token
    const token = jwt.sign(
      { id: admin._id, type: 'admin' }, 
      process.env.JWT_SECRET, 
      { expiresIn: '7d' }
    );

    res.json({ 
      admin: { 
        id: admin._id, 
        username: admin.username 
      }, 
      token 
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;