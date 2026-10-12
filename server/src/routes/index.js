import express from 'express';
import authRoutes from './authRoutes.js';
import auditRoutes from './auditRoutes.js';

const router = express.Router();

// System Health Check
router.get('/ping', (req, res) => {
    res.json({ message: 'HMS API Router Active', timestamp: new Date().toISOString() });
});

// Mount Domain Routes
router.use('/auth', authRoutes);
router.use('/audit-logs', auditRoutes);

export default router;
