import express from 'express';
import pool from '../config/db.js';
import { verifyToken } from '../middleware/authMiddleware.js';
import { requireRoles } from '../middleware/roleGuard.js';
import { logAudit } from '../middleware/auditLogger.js';

const router = express.Router();

/**
 * GET /api/audit-logs
 * Protected endpoint: ADMIN only.
 * Returns the latest 50 security and clinical audit log records.
 */
router.get('/', verifyToken, requireRoles(['ADMIN']), async (req, res) => {
    try {
        const [logs] = await pool.query(
            `SELECT a.id, a.user_id, u.username, a.action, a.entity, a.entity_id, a.ip_address, a.details, a.timestamp
             FROM audit_logs a
             LEFT JOIN users u ON a.user_id = u.id
             ORDER BY a.timestamp DESC
             LIMIT 50`
        );

        res.json({
            success: true,
            count: logs.length,
            logs
        });
    } catch (error) {
        console.error('Fetch audit logs error:', error);
        res.status(500).json({ success: false, message: 'Failed to retrieve audit trail.' });
    }
});

/**
 * POST /api/audit-logs/sensitive-action
 * Protected endpoint: ADMIN and DOCTOR only.
 * Demonstrates RBAC enforcement and automatic audit trail insertion.
 */
router.post('/sensitive-action', verifyToken, requireRoles(['ADMIN', 'DOCTOR']), async (req, res) => {
    try {
        const { actionName = 'UPDATE_CLINICAL_RECORD', entity = 'medical_records', entityId = 1, details = 'Test clinical note update' } = req.body;

        await logAudit(req.user.id, actionName, entity, entityId, details, req);

        res.json({
            success: true,
            message: `Sensitive clinical action '${actionName}' executed and recorded to audit_logs successfully.`,
            performedBy: req.user
        });
    } catch (error) {
        console.error('Sensitive action error:', error);
        res.status(500).json({ success: false, message: 'Failed to process sensitive action.' });
    }
});

export default router;
