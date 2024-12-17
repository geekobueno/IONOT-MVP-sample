// scripts/seedData.js
const mongoose = require('mongoose');
const Candidate = require('../src/models/Candidate');
const Project = require('../src/models/Project');
const Progress = require('../src/models/Progress');
const path = require('path');
require('dotenv').config({ 
  path: path.resolve(__dirname, '../.env') 
});
const seedDatabase = async () => {

  console.log('MONGODB_URI:', process.env.MONGODB_URI);

  if (!process.env.MONGODB_URI) {
    console.error('MongoDB URI is not defined. Check your .env file.');
    process.exit(1);
  }

  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    // Clear existing data
    await Candidate.deleteMany({});
    await Project.deleteMany({});
    await Progress.deleteMany({});

    // Create sample candidates
    const candidates = await Candidate.create([
      { name: 'John Doe', email: 'john@example.com' },
      { name: 'Jane Smith', email: 'jane@example.com' },
      { name: 'Mike Johnson', email: 'mike@example.com' }
    ]);

    // Create sample projects
    const projects = await Project.create([
      {
        title: 'Web Development Basics',
        description: 'Create a simple responsive website',
        difficulty: 'Beginner',
        status: 'Pending'
      },
      {
        title: 'Advanced React Application',
        description: 'Build a complex React application with state management',
        difficulty: 'Advanced',
        status: 'Pending'
      },
      {
        title: 'Backend API Development',
        description: 'Create a RESTful API with authentication',
        difficulty: 'Intermediate',
        status: 'Pending'
      }
    ]);

    // Create some progress records
    await Progress.create([
      {
        candidate: candidates[0]._id,
        project: projects[0]._id,
        percentComplete: 50,
        score: 75
      },
      {
        candidate: candidates[1]._id,
        project: projects[1]._id,
        percentComplete: 25,
        score: 60
      }
    ]);

    console.log('Database seeded successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();