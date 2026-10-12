/**
 * RBAC Authorization Middleware: Checks if req.user.role is authorized to access the route.
 * Supports both requireRoles(['ADMIN', 'DOCTOR']) and requireRoles('ADMIN', 'DOCTOR').
 */
export const requireRoles = (...roles) => {
    // Flatten in case an array is passed, e.g. requireRoles(['ADMIN', 'DOCTOR'])
    const allowedRoles = roles.flat().map(r => String(r).toUpperCase());

    return (req, res, next) => {
        if (!req.user || !req.user.role) {
            return res.status(401).json({
                success: false,
                message: 'Unauthorized: No authenticated user role detected.'
            });
        }

        const userRole = String(req.user.role).toUpperCase();

        if (!allowedRoles.includes(userRole)) {
            return res.status(403).json({
                success: false,
                message: `Access Denied: Insufficient permissions for role '${req.user.role}'. Required: ${allowedRoles.join(', ')}`
            });
        }

        next();
    };
};

// Aliases for flexibility
export const authorizeRoles = requireRoles;
export default requireRoles;
