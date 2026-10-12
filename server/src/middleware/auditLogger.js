import pool from '../config/db.js';

/**
 * Persists an audit log entry into the MySQL audit_logs table.
 *
 * @param {number|null} userId - ID of the user performing the action
 * @param {string} action - Action performed (e.g. 'LOGIN', 'CREATE', 'UPDATE', 'DELETE', 'DISPENSE')
 * @param {string} entity - Name of the affected entity/table (e.g. 'users', 'patients', 'prescriptions')
 * @param {string|number|null} entityId - Primary key of the affected record
 * @param {string|null} details - Contextual JSON string or description
 * @param {object|null} req - Express request object for IP resolution
 */
export const logAudit = async (userId, action, entity, entityId = null, details = null, req = null) => {
    try {
        const ipAddress = req?.headers?.['x-forwarded-for']?.split(',')[0]?.trim() ||
            req?.socket?.remoteAddress ||
            '127.0.0.1';

        await pool.query(
            `INSERT INTO audit_logs (user_id, action, entity, entity_id, ip_address, details)
             VALUES (?, ?, ?, ?, ?, ?)`,
            [
                userId || null,
                action,
                entity,
                entityId ? String(entityId) : null,
                ipAddress,
                typeof details === 'object' ? JSON.stringify(details) : details
            ]
        );
    } catch (error) {
        console.error('Audit log failed to record:', error.message);
    }
};

/**
 * Express middleware to automatically log sensitive operations after successful response.
 */
export const auditMiddleware = (action, entity, getEntityId = (req) => req.params.id) => {
    return (req, res, next) => {
        const originalSend = res.send;
        res.send = function (data) {
            if (res.statusCode >= 200 && res.statusCode < 300) {
                const entityId = getEntityId(req);
                const userId = req.user?.id || null;
                logAudit(userId, action, entity, entityId, `HTTP ${req.method} ${req.originalUrl}`, req);
            }
            return originalSend.apply(res, arguments);
        };
        next();
    };
};

export default { logAudit, auditMiddleware };
