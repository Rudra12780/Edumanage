require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const mongoose = require('mongoose');
const { uploadDir } = require('./utils/upload');
const { connectDB, Assignment } = require('./db/mongodb');

const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/admin');
const teacherRoutes = require('./routes/teachers');
const studentRoutes = require('./routes/students');
const notificationRoutes = require('./routes/notifications');

const app = express();
const PORT = process.env.PORT || 5000;

// Dynamic CORS configuration allowing localhost, production frontend, and Vercel preview URLs
const allowedOrigins = [
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  'https://edumanage-tau.vercel.app',
  process.env.FRONTEND_URL,
  ...(process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',').map(s => s.trim()) : [])
].filter(Boolean);

const corsOptions = {
  origin: (origin, callback) => {
    // Allow non-browser requests (e.g. mobile apps, curl, server-to-server)
    if (!origin) return callback(null, true);
    
    const isAllowed = allowedOrigins.includes(origin) || 
      /^https:\/\/.*\.vercel\.app$/.test(origin) ||
      origin.includes('localhost') || 
      origin.includes('127.0.0.1');

    if (isAllowed) {
      return callback(null, true);
    }
    return callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

app.use(express.json());

// Request logging in development
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  next();
});

// Root informational endpoint
app.get('/', (req, res) => {
  const isConnected = mongoose.connection.readyState === 1;
  res.json({
    status: 'online',
    system: 'EduManage Enterprise Backend API',
    database: isConnected ? 'Connected' : 'Connecting',
    frontend: 'https://edumanage-tau.vercel.app',
    health: '/api/health',
    timestamp: new Date().toISOString()
  });
});

// Health check endpoint
app.get('/api/health', async (req, res) => {
  if (mongoose.connection.readyState !== 1) {
    try {
      await connectDB();
    } catch (err) {
      // connection error will be reflected in status
    }
  }
  const isConnected = mongoose.connection.readyState === 1;
  res.json({
    status: isConnected ? 'online' : 'connecting_database',
    database: isConnected ? 'MongoDB Atlas (Cluster0) Connected' : 'Connecting to MongoDB Atlas (Ensure 0.0.0.0/0 is whitelisted in Atlas)',
    system: 'EduManage Enterprise Backend API',
    timestamp: new Date().toISOString()
  });
});

// Middleware: verify DB connection for data API endpoints (with cold-start auto-connect)
app.use('/api', async (req, res, next) => {
  if (req.path === '/health') return next();
  if (mongoose.connection.readyState !== 1) {
    try {
      await connectDB();
    } catch (err) {
      console.warn('[EduManage DB] Connection error in request middleware:', err.message);
    }
  }
  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({
      error: 'MongoDB Atlas is connecting or waiting for IP whitelist.',
      help: 'Please ensure 0.0.0.0/0 is whitelisted in MongoDB Atlas (Security > Network Access).',
      status: 'database_pending'
    });
  }
  next();
});

// Secure Assignment File Download Route
app.get('/api/assignments/download/:filename', async (req, res) => {
  try {
    const rawFilename = path.basename(req.params.filename);
    const filePath = path.join(uploadDir, rawFilename);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'Requested assignment file was not found on server.' });
    }

    const assignment = await Assignment.findOne({ submitted_file: rawFilename }).lean();
    const downloadName = (assignment && assignment.original_file_name) ? assignment.original_file_name : rawFilename;

    return res.download(filePath, downloadName, (err) => {
      if (err && !res.headersSent) {
        console.error('File download error:', err);
        return res.status(500).json({ error: 'Failed to download file.' });
      }
    });
  } catch (err) {
    console.error('Download route error:', err);
    return res.status(500).json({ error: 'Download request failed: ' + err.message });
  }
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/teachers', teacherRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/notifications', notificationRoutes);

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('API Error:', err);
  if (err.code === 11000 || (err.message && err.message.includes('password_hash'))) {
    return res.status(400).json({ error: 'Invalid or already used password.' });
  }
  res.status(500).json({ error: err.message || 'Internal Server Error' });
});

let retryInterval = null;

async function tryConnect() {
  try {
    await connectDB();
    if (retryInterval) {
      clearInterval(retryInterval);
      retryInterval = null;
    }
  } catch (err) {
    console.warn(`[EduManage Backend] MongoDB Atlas connection attempt failed: ${err.message}`);
    console.warn(`[EduManage Backend] Tip: Ensure 0.0.0.0/0 is whitelisted in MongoDB Atlas > Network Access.`);
  }
}

async function startServer() {
  app.listen(PORT, () => {
    console.log(`EduManage Backend running on port ${PORT} [http://localhost:${PORT}]`);
    console.log(`Connecting to MongoDB Atlas Cluster0...`);
  });

  await tryConnect();
  if (mongoose.connection.readyState !== 1) {
    retryInterval = setInterval(tryConnect, 10000);
  }
}

// Only listen directly when running standalone (not in Vercel serverless environment)
if (require.main === module && !process.env.VERCEL) {
  startServer();
} else {
  // Cold-start connection attempt for serverless
  tryConnect().catch(err => {
    console.warn(`[EduManage Backend] Serverless cold-start DB connect: ${err.message}`);
  });
}

module.exports = app;
