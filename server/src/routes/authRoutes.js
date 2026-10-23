import express from 'express';
import { login, register, logout, getMe, clearUsers, getPendingUsers, approveUser, rejectUser } from '../controllers/authController.js';
import { verifyToken } from '../middleware/authMiddleware.js';
import { requireRoles } from '../middleware/roleGuard.js';

const router = express.Router();

// Public Authentication & Dynamic Setup Endpoints
router.post('/login', login);
router.post('/register', register);
router.post('/logout', logout);
router.post('/clear-users', clearUsers);

// Protected Session Verification Endpoint
router.get('/me', verifyToken, getMe);

// Admin-Only: Pending Registration Management
router.get('/pending-users', verifyToken, requireRoles('ADMIN'), getPendingUsers);
router.put('/approve-user/:id', verifyToken, requireRoles('ADMIN'), approveUser);
router.delete('/reject-user/:id', verifyToken, requireRoles('ADMIN'), rejectUser);

export default router;
