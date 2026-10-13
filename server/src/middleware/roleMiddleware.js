import { logAudit } from './auditLogger.js';

/**
 * Role-Based Access Control (RBAC) Middleware.
 * Verifies that the authenticated user possesses one of the allowed roles.
 * Returns HTTP 403 Forbidden with details if authorization fails.
 */
export const requireRoles = (...roles) => {
    // Flatten nested arrays, e.g. requireRoles(['ADMIN', 'DOCTOR']) or requireRoles('ADMIN', 'DOCTOR')
    const allowedRoles = roles.flat().map(r => String(r).toUpperCase());

    return async (req, res, next) => {
        if (!req.user || !req.user.role) {
            return res.status(401).json({
                success: false,
                message: 'Authentication required. No authenticated user identity detected.'
            });
        }

        const userRole = String(req.user.role).toUpperCase();

        if (!allowedRoles.includes(userRole)) {
            // Log unauthorized access attempt for security auditing
            try {
                await logAudit(
                    req.user.id,
                    'SECURITY_ACCESS_DENIED',
                    'rbac_permission',
                    req.user.id,
                    `Unauthorized access attempt to ${req.method} ${req.originalUrl}. User role: ${userRole}. Required: ${allowedRoles.join(', ')}`,
                    req
                );
            } catch (auditErr) {
                console.error('Audit logging error on 403:', auditErr);
            }

            return res.status(403).json({
                success: false,
                message: `Access Denied: Role '${req.user.role}' is not authorized to access this resource. Allowed roles: ${allowedRoles.join(', ')}`,
                requiredRoles: allowedRoles,
                currentRole: req.user.role
            });
        }

        next();
    };
};

export const authorizeRoles = requireRoles;
export const roleGuard = requireRoles;
export default requireRoles;
