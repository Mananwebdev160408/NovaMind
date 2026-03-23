require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const errorHandler = require('./middleware/errorHandler');

// Import routes
const authRoutes = require('./routes/auth');
const notesRoutes = require('./routes/notes');
const writingRoutes = require('./routes/writing');
const documentsRoutes = require('./routes/documents');
const meetingsRoutes = require('./routes/meetings');
const languageRoutes = require('./routes/language');
const codeRoutes = require('./routes/code');
const knowledgeRoutes = require('./routes/knowledge');
const profileRoutes = require('./routes/profile');

const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/novamind';

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' })); // Increased for document uploads
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/notes', notesRoutes);
app.use('/api/writing', writingRoutes);
app.use('/api/documents', documentsRoutes);
app.use('/api/meetings', meetingsRoutes);
app.use('/api/language', languageRoutes);
app.use('/api/code', codeRoutes);
app.use('/api/knowledge', knowledgeRoutes);
app.use('/api/profile', profileRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Endpoint not found' });
});

// Error handler (must be last)
app.use(errorHandler);

// Database Connection
mongoose.connect(MONGO_URI)
  .then(() => {
    console.log('✓ Connected to MongoDB');
    console.log('✓ NovaMind API Server initialized');
    app.listen(PORT, () => {
      console.log(`✓ Server running on port ${PORT}`);
      console.log(`✓ Environment: ${process.env.NODE_ENV || 'development'}`);
    });
  })
  .catch(err => {
    console.error('✗ MongoDB connection error:', err);
    process.exit(1);
  });
