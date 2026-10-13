import express from 'express';
import { login, logout, getMe, clearUsers } from '../controllers/authController.js';
import { verifyToken } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public Authentication & Dynamic Setup Endpoints
router.post('/login', login);
router.post('/logout', logout);
router.post('/clear-users', clearUsers);

// Protected Session Verification Endpoint
router.get('/me', verifyToken, getMe);

export default router;
