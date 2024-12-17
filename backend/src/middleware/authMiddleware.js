const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { Candidate } = require('../models/Candidate');
const { Admin } = require('../models/Admin');

// Candidate Authentication Middleware
const candidateAuth = async (req, res, next) => {
  try {
    const token = req.header('Authorization').replace('Bearer ', '');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Ensure it's a candidate token
    if (decoded.type !== 'candidate') {
      throw new Error();
    }

    const candidate = await Candidate.findById(decoded.id);

    if (!candidate) {
      throw new Error();
    }

    req.token = token;
    req.user = candidate;
    next();
  } catch (e) {
    res.status(401).send({ error: 'Please authenticate as a candidate.' });
  }
};

// Admin Authentication Middleware
const adminAuth = async (req, res, next) => {
  try {
    const token = req.header('Authorization').replace('Bearer ', '');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Ensure it's an admin token
    if (decoded.type !== 'admin') {
      throw new Error();
    }

    const admin = await Admin.findById(decoded.id);

    if (!admin) {
      throw new Error();
    }

    req.token = token;
    req.user = admin;
    next();
  } catch (e) {
    res.status(401).send({ error: 'Admin authentication required.' });
  }
};

// Authentication Routes
const authRouter = express.Router();

// Candidate Registration
authRouter.post('/candidates/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const existingCandidate = await Candidate.findOne({ email });
    
    if (existingCandidate) {
      return res.status(400).send({ error: 'Email already in use' });
    }

    const candidate = new Candidate({ name, email, password });
    await candidate.save();

    const token = jwt.sign({ id: candidate._id }, JWT_SECRET, { expiresIn: '7d' });
    
    res.status(201).send({ candidate, token });
  } catch (e) {
    res.status(400).send(e);
  }
});

// Candidate Login
authRouter.post('/candidates/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const candidate = await Candidate.findOne({ email });

    if (!candidate) {
      return res.status(401).send({ error: 'Login failed' });
    }

    const isMatch = await bcrypt.compare(password, candidate.password);

    if (!isMatch) {
      return res.status(401).send({ error: 'Login failed' });
    }

    const token = jwt.sign({ id: candidate._id }, JWT_SECRET, { expiresIn: '7d' });
    
    res.send({ candidate, token });
  } catch (e) {
    res.status(400).send(e);
  }
});

// Admin Login (Hardcoded for simplicity)
authRouter.post('/admin/login', async (req, res) => {
  const { username, password } = req.body;

  if (username !== process.env.ADMIN_USERNAME || password !== process.env.ADMIN_PASSWORD) {
    return res.status(401).send({ error: 'Authentication failed' });
  }

  // Find or create admin if not exists
  let admin = await Admin.findOne({ username: process.env.ADMIN_USERNAME });
  if (!admin) {
    admin = new Admin({ 
      username: process.env.ADMIN_USERNAME, 
      password: process.env.ADMIN_PASSWORD 
    });
    await admin.save();
  }

  const token = jwt.sign({ id: admin._id }, JWT_SECRET, { expiresIn: '7d' });
  
  res.send({ admin: { username: admin.username }, token });
});

module.exports = {
  authRouter,
  candidateAuth,
  adminAuth
};