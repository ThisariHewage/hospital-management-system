import jwt from 'jsonwebtoken';

export const authenticateToken = (req, res, next) => {
    // Extract token from HTTP-only cookie first, fallback to Authorization header
    const token = req.cookies?.jwt_token || req.headers.authorization?.split(' ')[1];

    if (!token) {
        return res.status(401).json({
            success: false,
            message: 'Authentication token missing. Please log in.'
        });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'super_secret_jwt_hms_key_2026_hospital');
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(403).json({
            success: false,
            message: 'Invalid or expired session token.'
        });
    }
};
