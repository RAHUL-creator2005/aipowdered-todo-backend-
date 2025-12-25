import express from 'express';
const router = express.Router();
import { handleChat, getChatHistory } from '../controllers/ai.controller.js';
import { protect } from '../middleware/auth.middleware.js';

// All AI routes require authentication
router.use(protect);

// Chat endpoint - main AI interaction
router.post('/chat', handleChat);

// Chat history endpoint (placeholder for future)
router.get('/history', getChatHistory);

export default router;
