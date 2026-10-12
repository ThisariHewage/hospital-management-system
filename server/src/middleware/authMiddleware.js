import jwt from 'jsonwebtoken';

/**
 * Authentication Middleware: Validates JWT signature and extracts user details onto req.user.
 * Reads primarily from HTTP-only cookie 'jwt_token', with fallback to Bearer header.
 */
export const verifyToken = (req, res, next) => {
    const token = req.cookies?.jwt_token || req.headers.authorization?.split(' ')[1];

    if (!token) {
        return res.status(401).json({
            success: false,
            message: 'Authentication required. No token provided.'
        });
    }

    try {
        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET || 'super_secret_jwt_hms_key_2026_hospital'
        );
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(403).json({
            success: false,
            message: 'Invalid or expired session token.'
        });
    }
};

// Alias for backwards compatibility
export const authenticateToken = verifyToken;
export default verifyToken;
