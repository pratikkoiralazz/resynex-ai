const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const researchRoutes = require('./routes/researchRoutes');
const errorHandler = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 5000;

// Security and Middleware
app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:3000' }));
app.use(express.json({ limit: '10mb' }));

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { error: 'Too many requests from this IP, please try again later.' },
});
app.use('/api/', limiter);

// API Endpoints
app.use('/api/research', researchRoutes);

// Health Endpoint
app.get('/health', (req, res) => res.json({ status: 'ok', timestamp: new Date() }));

// Global Error Handler
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Autonomous AI Research Agent backend listening on port ${PORT}`);
});