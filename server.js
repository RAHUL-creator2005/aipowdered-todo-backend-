<<<<<<< HEAD
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import startMCP from './mcp/mcpServer.js';
// Load environment variables
dotenv.config();

// Connect to database
connectDB("mongodb+srv://rahulkeerthivasan61_db_user:rahul1234@cluster3todoapp.7iqgqtv.mongodb.net/");

// Initialize Express app
const app = express();

// mcp server start
startMCP();

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
import authRoutes from './routes/auth.routes.js';
import aiRoutes from './routes/ai.routes.js';

app.use('/api/auth', authRoutes);
app.use('/api/ai', aiRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'AI Powered To Do App Backend is running',
    timestamp: new Date().toISOString()
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    success: false,
    message: 'Internal server error'
  });
});





// Server configuration
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 AI Powered To Do App Backend server running on port ${PORT}`);
  console.log(`📱 Health check available at: http://localhost:${PORT}/api/health`);
  console.log(`🔐 Auth endpoints available at: http://localhost:${PORT}/api/auth`);
  console.log(`🤖 AI endpoints available at: http://localhost:${PORT}/api/ai`);
});
=======
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import startMCP from './mcp/mcpServer.js';
// Load environment variables
dotenv.config();

// Connect to database
connectDB("mongodb+srv://rahulkeerthivasan61_db_user:rahul1234@cluster3todoapp.7iqgqtv.mongodb.net/");

// Initialize Express app
const app = express();

// mcp server start
startMCP();

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
import authRoutes from './routes/auth.routes.js';
import aiRoutes from './routes/ai.routes.js';

app.use('/api/auth', authRoutes);
app.use('/api/ai', aiRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'AI Powered To Do App Backend is running',
    timestamp: new Date().toISOString()
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    success: false,
    message: 'Internal server error'
  });
});





// Server configuration
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 AI Powered To Do App Backend server running on port ${PORT}`);
  console.log(`📱 Health check available at: http://localhost:${PORT}/api/health`);
  console.log(`🔐 Auth endpoints available at: http://localhost:${PORT}/api/auth`);
  console.log(`🤖 AI endpoints available at: http://localhost:${PORT}/api/ai`);
});
>>>>>>> d5e08c6d0d73c521125254093d50e330bbaa2660
