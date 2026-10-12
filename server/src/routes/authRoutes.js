import express from 'express';
import { login, logout, getMe, demoSwitch } from '../controllers/authController.js';
import { verifyToken } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public Authentication Endpoints
router.post('/login', login);
router.post('/logout', logout);

// Protected User Session Endpoint
router.get('/me', verifyToken, getMe);

// Quick Demo Persona Switcher (Development & Review)
router.post('/demo-switch', demoSwitch);
router.get('/demo-switch/:role', demoSwitch);

export default router;
