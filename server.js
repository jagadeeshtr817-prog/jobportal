const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const { authenticateMaster } = require('./middleware/auth');
const masterRoutes = require('./routes/master');

const Job = require('./models/Job');
const Application = require('./models/Application');

const app = express();

// Middleware
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', '*');
    res.header('Access-Control-Allow-Headers', '*');
    next();
});
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Use master routes
app.use('/master', masterRoutes);

// Serve static files
app.use(express.static(path.join(__dirname), {
    setHeaders: (res, filePath) => {
        if (filePath.endsWith('.js')) {
            res.setHeader('Content-Type', 'application/javascript');
        } else if (filePath.endsWith('.css')) {
            res.setHeader('Content-Type', 'text/css');
        } else if (filePath.endsWith('.html')) {
            res.setHeader('Content-Type', 'text/html');
        }
    }
}));
// Serve static files
app.use(express.static(__dirname, {
    setHeaders: (res, path) => {
        if (path.endsWith('.js')) {
            res.setHeader('Content-Type', 'application/javascript');
        }
    }
}));

// Add request logging middleware
app.use((req, res, next) => {
    console.log(`${req.method} ${req.path}`);
    next();
});

// Connect to MongoDB with retry logic and initialization
const connectWithRetry = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI, {
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
        });
        console.log('Connected to MongoDB Atlas');

        // Remove all existing jobs and add new ones
        await Job.deleteMany({});
        console.log('Cleared existing jobs');

        // Always initialize with our complete set of jobs
        const jobCount = 0; // Force initialization
        if (jobCount === 0) {
            // Seed initial jobs
            const initialJobs = [
                {
                    title: 'Senior Frontend Developer',
                    company: 'TechSoft Solutions',
                    location: 'Bangalore',
                    type: 'Full-time',
                    experience: '5-8 years',
                    salary: '₹18-25 LPA',
                    skills: ['React', 'TypeScript', 'Node.js'],
                    description: 'Lead frontend development for enterprise applications'
                },
                {
                    title: 'Machine Learning Engineer',
                    company: 'AI Innovations',
                    location: 'Hybrid - Bangalore',
                    type: 'Full-time',
                    experience: '3-6 years',
                    salary: '₹20-30 LPA',
                    skills: ['Python', 'TensorFlow', 'PyTorch'],
                    description: 'Develop and deploy ML models for real-world applications'
                },
                {
                    title: 'DevOps Engineer',
                    company: 'CloudTech Systems',
                    location: 'Remote',
                    type: 'Full-time',
                    experience: '4-7 years',
                    salary: '₹22-32 LPA',
                    skills: ['AWS', 'Docker', 'Kubernetes', 'Jenkins'],
                    description: 'Manage and optimize cloud infrastructure and CI/CD pipelines'
                },
                {
                    title: 'Mobile App Developer',
                    company: 'AppWave Technologies',
                    location: 'Pune',
                    type: 'Full-time',
                    experience: '2-5 years',
                    salary: '₹12-18 LPA',
                    skills: ['React Native', 'iOS', 'Android', 'Flutter'],
                    description: 'Develop cross-platform mobile applications using modern frameworks'
                },
                {
                    title: 'Data Analyst',
                    company: 'DataMetrics Solutions',
                    location: 'Hyderabad',
                    type: 'Full-time',
                    experience: '1-3 years',
                    salary: '₹8-12 LPA',
                    skills: ['SQL', 'Python', 'Tableau', 'Excel'],
                    description: 'Analyze data and create meaningful insights for business decisions'
                }
            ];

            await Job.insertMany(initialJobs);
            console.log('Initialized database with sample jobs');
        }
    } catch (err) {
        console.error('MongoDB connection error:', err);
        console.log('Retrying connection in 5 seconds...');
        setTimeout(connectWithRetry, 5000);
    }
};

// Initial connection attempt
connectWithRetry();

// API Routes
// Get all jobs
app.get('/api/jobs', async (req, res) => {
    try {
        console.log('Fetching jobs from database...');
        
        const jobs = await Job.find().sort({ createdAt: -1 });
        console.log(`Found ${jobs.length} jobs:`, jobs);
        
        if (!jobs || jobs.length === 0) {
            // If no jobs found, send empty array instead of 204
            return res.json([]);
        }
        
        res.json(jobs);
    } catch (error) {
        console.error('Error fetching jobs:', error);
        res.status(500).json({ message: error.message });
    }
});

// Add a new job
app.post('/api/jobs', async (req, res) => {
    try {
        const job = new Job(req.body);
        const savedJob = await job.save();
        res.status(201).json(savedJob);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Submit a job application
app.post('/api/applications', async (req, res) => {
    try {
        const application = new Application(req.body);
        const savedApplication = await application.save();
        res.status(201).json(savedApplication);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Master login route
app.post('/api/master/login', (req, res) => {
    const { username, password } = req.body;
    
    if (username === process.env.MASTER_USERNAME && password === process.env.MASTER_PASSWORD) {
        const token = jwt.sign({ username }, process.env.JWT_SECRET, { expiresIn: '24h' });
        res.json({ token });
    } else {
        res.status(401).json({ message: 'Invalid credentials' });
    }
});

// Protected master dashboard route
app.get('/api/master/applications', authenticateMaster, async (req, res) => {
    try {
        const applications = await Application.find()
            .populate('jobId')
            .sort({ createdAt: -1 });

        console.log('Raw applications:', applications); // Debug log

        // Group applications by job title
        const applicationsByJob = applications.reduce((acc, app) => {
            // Check if jobId exists and has title
            const jobTitle = app.jobId ? app.jobId.title : 'Uncategorized';
            
            if (!acc[jobTitle]) {
                acc[jobTitle] = [];
            }
            
            // Create application object with all fields
            const applicationData = {
                applicationId: app._id,
                name: app.name, // Changed from applicantName to name
                email: app.email,
                phone: app.phone,
                experience: app.experience,
                noticePeriod: app.noticePeriod,
                expectedCtc: app.expectedCtc,
                coverLetter: app.coverLetter,
                resume: app.resume,
                createdAt: app.createdAt
            };
            
            console.log('Processed application:', applicationData); // Debug log
            acc[jobTitle].push(applicationData);
            return acc;
        }, {});

        console.log('Grouped applications:', applicationsByJob); // Debug log
        res.json(applicationsByJob);
    } catch (error) {
        console.error('Error in /api/master/applications:', error);
        res.status(500).json({ message: error.message });
    }
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});