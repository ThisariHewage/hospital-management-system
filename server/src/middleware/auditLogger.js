import pool from '../config/db.js';

export const logAudit = async (userId, action, entity, entityId, details, req) => {
    try {
        const ipAddress = req?.headers['x-forwarded-for'] || req?.socket?.remoteAddress || '127.0.0.1';
        await pool.query(
            `INSERT INTO audit_logs (user_id, action, entity, entity_id, ip_address, details)
       VALUES (?, ?, ?, ?, ?, ?)`,
            [userId || null, action, entity, entityId ? String(entityId) : null, ipAddress, details || null]
        );
    } catch (error) {
        console.error('Audit log failed to record:', error.message);
    }
};
