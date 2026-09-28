require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const apiRoutes = require('./routes/api');
const seedDatabase = require('./seed');

const app = express();
const PORT = process.env.PORT || 5000;

// Security Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());

// Rate Limiting for AI endpoints
const aiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 AI requests per window
  message: { error: 'Too many requests from this IP, please try again after 15 minutes.' }
});
app.use('/api/ai', aiLimiter);

// Health Check Endpoint
app.get('/api/health', (req, res) => {
  const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'degraded';
  const hindsightStatus = (process.env.HINDSIGHT_API_URL && process.env.HINDSIGHT_API_KEY) ? 'connected' : 'degraded';
  
  res.status(dbStatus === 'connected' ? 200 : 503).json({
    status: (dbStatus === 'connected' && hindsightStatus === 'connected') ? 'ok' : 'degraded',
    service: 'DealMind',
    database: dbStatus,
    hindsight: hindsightStatus
  });
});

// Demo Reset Endpoint
app.post('/api/demo/reset', async (req, res) => {
  if (process.env.NODE_ENV === 'production') {
    return res.status(403).json({ error: 'Demo reset disabled in production' });
  }
  try {
    // Drop database and reseed
    await mongoose.connection.db.dropDatabase();
    await seedDatabase();
    res.json({ success: true, message: 'Demo environment reset successfully.' });
  } catch (err) {
    console.error('Reset error:', err);
    res.status(500).json({ error: 'Failed to reset demo data' });
  }
});

// Main API Routes
app.use('/api', apiRoutes);

// Centralized Error Handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: process.env.NODE_ENV === 'production' 
      ? 'An unexpected error occurred. Please try again later.' 
      : err.message 
  });
});

// Database connection
const MONGODB_URI = process.env.MONGODB_URI;

const startServer = async () => {
  try {
    let uri = MONGODB_URI;
    if (!uri) {
      if (process.env.NODE_ENV === 'production') {
        console.error('❌ FATAL: Production database configuration (MONGODB_URI) is missing.');
        process.exit(1);
      }
      console.log('No MONGODB_URI found, starting in-memory MongoDB for demo...');
      const { MongoMemoryServer } = require('mongodb-memory-server');
      const mongod = await MongoMemoryServer.create();
      uri = mongod.getUri();
    }

    await mongoose.connect(uri);
    console.log(`Connected to MongoDB`);
    
    // Seed data for hackathon demo if starting fresh
    if (!MONGODB_URI) {
      await seedDatabase();
    }
    
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  }
};

startServer();
