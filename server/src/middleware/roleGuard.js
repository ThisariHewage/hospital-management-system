export const authorizeRoles = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req.user || !req.user.role) {
            return res.status(401).json({
                success: false,
                message: 'Unauthorized: User role not identified.'
            });
        }

        const normalizedUserRole = req.user.role.toUpperCase();
        const normalizedAllowedRoles = allowedRoles.map(role => role.toUpperCase());

        if (!normalizedAllowedRoles.includes(normalizedUserRole)) {
            return res.status(403).json({
                success: false,
                message: `Forbidden: Access restricted. Role '${req.user.role}' lacks permission.`
            });
        }

        next();
    };
};
