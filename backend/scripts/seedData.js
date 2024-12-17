const mongoose = require('mongoose');
const { Candidate } = require('../src/models/Candidate');
const { Admin } = require('../src/models/Admin');
const { Progress } = require('../src/models/Progress');
const { Project } = require('../src/models/Project');
require('dotenv').config({ path: '../.env' });


require('dotenv').config();

// Seed Data
const seedData = async () => {
  console.log(process.env.MONGODB_URI)
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });

    // Clear existing data
    await Candidate.deleteMany({});
    await Project.deleteMany({});
    await Progress.deleteMany({});
    await Admin.deleteMany({});

    // Create Admin
    const admin = new Admin({
      username: 'admin',
      password: 'adminpassword'
    });
    await admin.save();

    // Create Sample Projects
    const projects = [
      {
        title: 'React Todo App',
        description: 'Build a full-featured todo application using React',
        difficultyLevel: 'Beginner',
        pointsWorth: 50
      },
      {
        title: 'Express REST API',
        description: 'Create a RESTful API with Express and MongoDB',
        difficultyLevel: 'Intermediate',
        pointsWorth: 75
      },
      {
        title: 'Full-stack E-commerce Platform',
        description: 'Develop a complete e-commerce website with payment integration',
        difficultyLevel: 'Advanced',
        pointsWorth: 100
      },
      {
        title: 'Machine Learning Recommender',
        description: 'Build a recommendation system using Python and scikit-learn',
        difficultyLevel: 'Advanced',
        pointsWorth: 125
      }
    ];
    const savedProjects = await Project.insertMany(projects);

    // Create Sample Candidates
    const candidates = [
      {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123',
        points: 0
      },
      {
        name: 'Jane Smith',
        email: 'jane@example.com',
        password: 'password456',
        points: 0
      },
      {
        name: 'Mike Johnson',
        email: 'mike@example.com',
        password: 'password789',
        points: 0
      }
    ];
    const savedCandidates = await Candidate.insertMany(candidates);

    // Create Sample Progress Entries (optional)
    const progresses = [
      {
        candidate: savedCandidates[0]._id,
        project: savedProjects[0]._id,
        githubLink: 'https://github.com/johndoe/todo-app',
        completionPercentage: 30,
        status: 'In Progress'
      },
      {
        candidate: savedCandidates[1]._id,
        project: savedProjects[1]._id,
        githubLink: 'https://github.com/janesmith/rest-api',
        completionPercentage: 60,
        status: 'In Progress'
      }
    ];
    await Progress.insertMany(progresses);

    console.log('Database seeded successfully!');
    
    // Close the connection
    await mongoose.connection.close();
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

// Run the seeding script
seedData();