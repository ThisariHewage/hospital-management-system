import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import pool from '../config/db.js';
import { logAudit } from '../middleware/auditLogger.js';

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_jwt_hms_key_2026_hospital';

/**
 * Login Controller:
 * Verifies credentials, generates signed JWT { id, username, role },
 * sets secure httpOnly cookie 'jwt_token', and records audit log.
 */
export const login = async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({
                success: false,
                message: 'Username and password are required.'
            });
        }

        // Fetch user with role name
        const [users] = await pool.query(
            `SELECT u.id, u.username, u.email, u.password_hash, u.is_active, r.name AS role
             FROM users u
             JOIN roles r ON u.role_id = r.id
             WHERE u.username = ? OR u.email = ?`,
            [username.trim(), username.trim()]
        );

        if (users.length === 0) {
            return res.status(401).json({
                success: false,
                message: 'Invalid username or password.'
            });
        }

        const user = users[0];

        if (!user.is_active) {
            return res.status(403).json({
                success: false,
                message: 'Account is deactivated. Please contact the administrator.'
            });
        }

        // Validate password with bcrypt
        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: 'Invalid username or password.'
            });
        }

        // Generate signed JWT
        const tokenPayload = {
            id: user.id,
            username: user.username,
            email: user.email,
            role: user.role
        };

        const token = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: '24h' });

        // Set secure HTTP-only cookie
        res.cookie('jwt_token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 24 * 60 * 60 * 1000 // 24 hours
        });

        // Record audit trail
        await logAudit(user.id, 'LOGIN', 'users', user.id, 'User logged in successfully', req);

        return res.json({
            success: true,
            message: 'Authentication successful.',
            token, // available for authorization header clients
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        return res.status(500).json({
            success: false,
            message: 'An error occurred during authentication.'
        });
    }
};

/**
 * Logout Controller:
 * Clears the httpOnly jwt_token cookie and logs audit action.
 */
export const logout = async (req, res) => {
    try {
        const userId = req.user?.id || null;

        res.clearCookie('jwt_token', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax'
        });

        if (userId) {
            await logAudit(userId, 'LOGOUT', 'users', userId, 'User logged out', req);
        }

        return res.json({
            success: true,
            message: 'Logged out successfully.'
        });
    } catch (error) {
        console.error('Logout error:', error);
        return res.status(500).json({
            success: false,
            message: 'Error during logout.'
        });
    }
};

/**
 * Me Controller:
 * Returns current authenticated session details from decoded token / database.
 */
export const getMe = async (req, res) => {
    try {
        const [users] = await pool.query(
            `SELECT u.id, u.username, u.email, u.is_active, u.created_at, r.name AS role
             FROM users u
             JOIN roles r ON u.role_id = r.id
             WHERE u.id = ?`,
            [req.user.id]
        );

        if (users.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'User session not found.'
            });
        }

        return res.json({
            success: true,
            user: users[0]
        });
    } catch (error) {
        console.error('GetMe error:', error);
        return res.status(500).json({
            success: false,
            message: 'Error fetching session user details.'
        });
    }
};

/**
 * Demo Persona Switcher Controller:
 * Rapidly issues a session for a specified role persona (for development and review testing).
 */
export const demoSwitch = async (req, res) => {
    try {
        const targetRole = (req.body.role || req.params.role || 'ADMIN').toUpperCase();

        const [users] = await pool.query(
            `SELECT u.id, u.username, u.email, r.name AS role
             FROM users u
             JOIN roles r ON u.role_id = r.id
             WHERE r.name = ? AND u.is_active = 1
             LIMIT 1`,
            [targetRole]
        );

        if (users.length === 0) {
            return res.status(404).json({
                success: false,
                message: `No active demo user found for role ${targetRole}.`
            });
        }

        const user = users[0];
        const token = jwt.sign(
            { id: user.id, username: user.username, email: user.email, role: user.role },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.cookie('jwt_token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 24 * 60 * 60 * 1000
        });

        await logAudit(user.id, 'DEMO_SWITCH', 'users', user.id, `Switched to ${targetRole} persona`, req);

        return res.json({
            success: true,
            message: `Switched session to role ${user.role} (${user.username})`,
            token,
            user
        });
    } catch (error) {
        console.error('Demo switch error:', error);
        return res.status(500).json({
            success: false,
            message: 'Error switching demo persona.'
        });
    }
};

export default { login, logout, getMe, demoSwitch };
