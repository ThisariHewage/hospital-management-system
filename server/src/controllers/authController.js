import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import pool from '../config/db.js';
import { logAudit } from '../middleware/auditLogger.js';
import { validateLoginInput } from '../validators/authValidator.js';

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_jwt_hms_key_2026_hospital';

// Super Admin env credentials – only account allowed to hold the ADMIN role
const ADMIN_USERNAME = process.env.ADMIN_USERNAME;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

/**
 * Centralized Role-to-Dashboard route mapping
 */
export const ROLE_DASHBOARDS = {
    ADMIN: '/admin/dashboard',
    DOCTOR: '/doctor/dashboard',
    NURSE: '/nurse/dashboard',
    RECEPTIONIST: '/receptionist/dashboard',
    LAB_STAFF: '/laboratory/dashboard',
    PHARMACIST: '/pharmacy/dashboard',
    ACCOUNTANT: '/accountant/dashboard'
};

/**
 * Login / Dynamic User Setup Controller:
 * 1. If user doesn't exist: dynamically creates the user with custom password & chosen role.
 * 2. If user exists: verifies BOTH password AND selected role against the database.
 */
export const login = async (req, res) => {
    try {
        const validation = validateLoginInput(req.body);
        if (!validation.isValid) {
            const firstError = Object.values(validation.errors)[0];
            return res.status(400).json({
                success: false,
                message: firstError,
                errors: validation.errors
            });
        }

        const { identifier, password, role: selectedRole } = validation.cleanData;

        // Fetch existing user from database
        const [users] = await pool.query(
            `SELECT u.id, u.username, u.email, u.password_hash, u.is_active, u.role_id, r.name AS role,
                    COALESCE(d.full_name, e.full_name, u.username) AS full_name
             FROM users u
             JOIN roles r ON u.role_id = r.id
             LEFT JOIN doctors d ON d.user_id = u.id
             LEFT JOIN employees e ON e.user_id = u.id
             WHERE u.username = ? OR u.email = ?`,
            [identifier, identifier]
        );

        let authenticatedUser = null;

        // -------------------------------------------------------------
        // CASE 1: USER DOES NOT EXIST -> DYNAMIC FIRST-TIME REGISTRATION
        // -------------------------------------------------------------
        if (users.length === 0) {
            const assignedRole = selectedRole || 'DOCTOR';

            // SECURITY: Block anyone from self-registering as ADMIN
            if (assignedRole === 'ADMIN') {
                return res.status(403).json({
                    success: false,
                    message: 'The Admin role is restricted. Only the designated super administrator can access this role.'
                });
            }

            // Find matching role_id from database
            const [roleRows] = await pool.query('SELECT id, name FROM roles WHERE name = ?', [assignedRole]);
            if (roleRows.length === 0) {
                return res.status(400).json({
                    success: false,
                    message: `Invalid role '${assignedRole}'. Must be a valid hospital role.`
                });
            }

            const roleId = roleRows[0].id;
            const hashedPassword = await bcrypt.hash(password, 10);
            const userEmail = `${identifier.toLowerCase()}@hospital.local`;

            // Insert new user into MySQL (pending admin approval)
            const [insertResult] = await pool.query(
                `INSERT INTO users (username, email, password_hash, role_id, is_active)
                 VALUES (?, ?, ?, ?, FALSE)`,
                [identifier, userEmail, hashedPassword, roleId]
            );

            const newUserId = insertResult.insertId;

            // Link to doctor or employee profile if available, or create a linked clinical record
            let fullName = identifier;
            if (assignedRole === 'DOCTOR') {
                fullName = `Dr. ${identifier.replace(/^(dr_?|doctor_?)/i, '').replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}`;
                // Link an unassigned doctor or create a new doctor entry
                const [unassignedDocs] = await pool.query('SELECT id FROM doctors WHERE user_id IS NULL LIMIT 1');
                if (unassignedDocs.length > 0) {
                    await pool.query('UPDATE doctors SET user_id = ?, full_name = ? WHERE id = ?', [newUserId, fullName, unassignedDocs[0].id]);
                } else {
                    await pool.query(
                        `INSERT INTO doctors (user_id, department_id, full_name, specialization, phone)
                         VALUES (?, 1, ?, 'Physician', '+1 555-0199')`,
                        [newUserId, fullName]
                    );
                }
            } else if (['NURSE', 'RECEPTIONIST', 'LAB_STAFF', 'PHARMACIST', 'ACCOUNTANT'].includes(assignedRole)) {
                fullName = identifier.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
                const [unassignedEmp] = await pool.query('SELECT id FROM employees WHERE user_id IS NULL LIMIT 1');
                if (unassignedEmp.length > 0) {
                    await pool.query('UPDATE employees SET user_id = ?, full_name = ? WHERE id = ?', [newUserId, fullName, unassignedEmp[0].id]);
                }
            }

            // Log registration event
            await logAudit(
                newUserId,
                'USER_REGISTERED',
                'users',
                newUserId,
                `User ${identifier} registered into database with role ${assignedRole}`,
                req
            );

            authenticatedUser = {
                id: newUserId,
                username: identifier,
                email: userEmail,
                role: assignedRole,
                role_id: roleId,
                full_name: fullName,
                is_active: true
            };
        } else {
            // -------------------------------------------------------------
            // CASE 2: USER EXISTS -> STRICT DATABASE VERIFICATION
            // -------------------------------------------------------------
            const existingUser = users[0];

            // 1. Check account active status (pending admin approval or deactivated)
            if (!existingUser.is_active) {
                return res.status(403).json({
                    success: false,
                    message: 'Your account is pending admin approval. Please wait for the hospital administrator to activate your access.',
                    pending: true
                });
            }

            // 2. Verify Password against MySQL bcrypt hash
            const isPasswordMatch = await bcrypt.compare(password, existingUser.password_hash);
            if (!isPasswordMatch) {
                return res.status(401).json({
                    success: false,
                    message: 'Incorrect password. Please enter the correct password registered for this account.'
                });
            }

            // SECURITY: Super admin .env credential check
            // If this is the admin account, the plain-text password MUST also match ADMIN_PASSWORD from .env
            if (existingUser.role === 'ADMIN') {
                if (!ADMIN_USERNAME || !ADMIN_PASSWORD) {
                    return res.status(500).json({
                        success: false,
                        message: 'Server misconfiguration: Admin credentials not set in environment.'
                    });
                }
                const isAdminUser = existingUser.username === ADMIN_USERNAME;
                const isAdminPasswordCorrect = password === ADMIN_PASSWORD;
                if (!isAdminUser || !isAdminPasswordCorrect) {
                    return res.status(403).json({
                        success: false,
                        message: 'Access denied. Admin login is restricted to the designated super administrator only.'
                    });
                }
            }

            // 3. Verify Selected Role matches registered Database Role
            if (selectedRole && existingUser.role !== selectedRole) {
                return res.status(403).json({
                    success: false,
                    message: `Role mismatch: This account is registered in the database as '${existingUser.role}', but you selected '${selectedRole}'. Please select '${existingUser.role}' to proceed.`,
                    registeredRole: existingUser.role,
                    selectedRole
                });
            }

            // Log successful login
            await logAudit(
                existingUser.id,
                'LOGIN_SUCCESS',
                'users',
                existingUser.id,
                `User ${existingUser.username} (${existingUser.role}) verified credentials successfully`,
                req
            );

            authenticatedUser = existingUser;
        }

        // Generate signed JWT
        const tokenPayload = {
            id: authenticatedUser.id,
            username: authenticatedUser.username,
            email: authenticatedUser.email,
            role: authenticatedUser.role,
            role_id: authenticatedUser.role_id
        };

        const token = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: '24h' });

        // Set secure HTTP-only cookie
        res.cookie('jwt_token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 24 * 60 * 60 * 1000 // 24 hours
        });

        const dashboardRoute = ROLE_DASHBOARDS[authenticatedUser.role] || '/admin/dashboard';

        return res.json({
            success: true,
            message: 'Authentication successful.',
            token,
            user: {
                id: authenticatedUser.id,
                username: authenticatedUser.username,
                email: authenticatedUser.email,
                role: authenticatedUser.role,
                full_name: authenticatedUser.full_name,
                dashboardRoute
            }
        });
    } catch (error) {
        console.error('Login / User Setup error:', error);
        return res.status(500).json({
            success: false,
            message: 'An internal server error occurred during authentication.'
        });
    }
};

/**
 * Clear Users Controller:
 * Resets user credentials from the database as requested.
 */
export const clearUsers = async (req, res) => {
    try {
        await pool.query('UPDATE doctors SET user_id = NULL');
        await pool.query('UPDATE employees SET user_id = NULL');
        await pool.query('UPDATE audit_logs SET user_id = NULL');
        await pool.query('DELETE FROM users');
        await pool.query('ALTER TABLE users AUTO_INCREMENT = 1');

        res.clearCookie('jwt_token', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax'
        });

        return res.json({
            success: true,
            message: 'All user credentials cleared from database successfully. You can now register fresh user accounts.'
        });
    } catch (error) {
        console.error('Clear users error:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to clear users from database.'
        });
    }
};

/**
 * Logout Controller
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
            await logAudit(userId, 'LOGOUT', 'users', userId, `User session closed`, req);
        }

        return res.json({
            success: true,
            message: 'Session closed successfully. Logged out.'
        });
    } catch (error) {
        console.error('Logout error:', error);
        return res.status(500).json({
            success: false,
            message: 'An error occurred during logout.'
        });
    }
};

/**
 * GetMe Controller
 */
export const getMe = async (req, res) => {
    try {
        const [users] = await pool.query(
            `SELECT u.id, u.username, u.email, u.is_active, u.created_at, r.name AS role,
                    COALESCE(d.full_name, e.full_name, u.username) AS full_name
             FROM users u
             JOIN roles r ON u.role_id = r.id
             LEFT JOIN doctors d ON d.user_id = u.id
             LEFT JOIN employees e ON e.user_id = u.id
             WHERE u.id = ?`,
            [req.user.id]
        );

        if (users.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'User session not found in database.'
            });
        }

        const user = users[0];
        const dashboardRoute = ROLE_DASHBOARDS[user.role] || '/admin/dashboard';

        return res.json({
            success: true,
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                role: user.role,
                full_name: user.full_name,
                is_active: user.is_active,
                created_at: user.created_at,
                dashboardRoute
            }
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
 * Dedicated Registration Controller (does NOT issue JWT):
 * Creates user with is_active=FALSE and returns pending status.
 */
export const register = async (req, res) => {
    try {
        const validation = validateLoginInput(req.body);
        if (!validation.isValid) {
            const firstError = Object.values(validation.errors)[0];
            return res.status(400).json({ success: false, message: firstError, errors: validation.errors });
        }

        const { identifier, password, role: selectedRole } = validation.cleanData;
        const assignedRole = selectedRole || 'DOCTOR';

        if (assignedRole === 'ADMIN') {
            return res.status(403).json({
                success: false,
                message: 'The Admin role is restricted. Only the designated super administrator can access this role.'
            });
        }

        // Check if username already exists
        const [existing] = await pool.query('SELECT id FROM users WHERE username = ?', [identifier]);
        if (existing.length > 0) {
            return res.status(409).json({
                success: false,
                message: 'This username is already registered. Please sign in or choose a different username.'
            });
        }

        const [roleRows] = await pool.query('SELECT id, name FROM roles WHERE name = ?', [assignedRole]);
        if (roleRows.length === 0) {
            return res.status(400).json({ success: false, message: `Invalid role '${assignedRole}'.` });
        }

        const roleId = roleRows[0].id;
        const hashedPassword = await bcrypt.hash(password, 10);
        const userEmail = `${identifier.toLowerCase()}@hospital.local`;

        // Insert as PENDING (is_active = FALSE)
        const [insertResult] = await pool.query(
            `INSERT INTO users (username, email, password_hash, role_id, is_active)
             VALUES (?, ?, ?, ?, FALSE)`,
            [identifier, userEmail, hashedPassword, roleId]
        );

        const newUserId = insertResult.insertId;

        // Link doctor/employee profile
        let fullName = identifier;
        if (assignedRole === 'DOCTOR') {
            fullName = `Dr. ${identifier.replace(/^(dr_?|doctor_?)/i, '').replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}`;
            const [unassignedDocs] = await pool.query('SELECT id FROM doctors WHERE user_id IS NULL LIMIT 1');
            if (unassignedDocs.length > 0) {
                await pool.query('UPDATE doctors SET user_id = ?, full_name = ? WHERE id = ?', [newUserId, fullName, unassignedDocs[0].id]);
            } else {
                await pool.query(
                    `INSERT INTO doctors (user_id, department_id, full_name, specialization, phone)
                     VALUES (?, 1, ?, 'Physician', '+1 555-0199')`,
                    [newUserId, fullName]
                );
            }
        } else if (['NURSE', 'RECEPTIONIST', 'LAB_STAFF', 'PHARMACIST', 'ACCOUNTANT'].includes(assignedRole)) {
            fullName = identifier.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
            const [unassignedEmp] = await pool.query('SELECT id FROM employees WHERE user_id IS NULL LIMIT 1');
            if (unassignedEmp.length > 0) {
                await pool.query('UPDATE employees SET user_id = ?, full_name = ? WHERE id = ?', [newUserId, fullName, unassignedEmp[0].id]);
            }
        }

        await logAudit(newUserId, 'USER_REGISTERED_PENDING', 'users', newUserId,
            `User ${identifier} registered with role ${assignedRole} — pending admin approval`, req);

        return res.status(201).json({
            success: true,
            pending: true,
            message: 'Registration submitted successfully. Your account is pending admin approval.'
        });
    } catch (error) {
        console.error('Register error:', error);
        return res.status(500).json({ success: false, message: 'An internal server error occurred during registration.' });
    }
};

/**
 * Get Pending Users (ADMIN only)
 */
export const getPendingUsers = async (req, res) => {
    try {
        const [users] = await pool.query(
            `SELECT u.id, u.username, u.email, u.created_at, r.name AS role,
                    COALESCE(d.full_name, e.full_name, u.username) AS full_name
             FROM users u
             JOIN roles r ON u.role_id = r.id
             LEFT JOIN doctors d ON d.user_id = u.id
             LEFT JOIN employees e ON e.user_id = u.id
             WHERE u.is_active = FALSE
             ORDER BY u.created_at DESC`
        );
        return res.json({ success: true, users });
    } catch (error) {
        console.error('Get pending users error:', error);
        return res.status(500).json({ success: false, message: 'Failed to fetch pending users.' });
    }
};

/**
 * Approve User (ADMIN only) — sets is_active = TRUE
 */
export const approveUser = async (req, res) => {
    try {
        const { id } = req.params;
        const [result] = await pool.query('UPDATE users SET is_active = TRUE WHERE id = ? AND is_active = FALSE', [id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'Pending user not found.' });
        }

        await logAudit(req.user.id, 'USER_APPROVED', 'users', id,
            `Admin approved user ID ${id}`, req);

        return res.json({ success: true, message: 'User approved successfully. They can now log in.' });
    } catch (error) {
        console.error('Approve user error:', error);
        return res.status(500).json({ success: false, message: 'Failed to approve user.' });
    }
};

/**
 * Reject User (ADMIN only) — deletes the pending user
 */
export const rejectUser = async (req, res) => {
    try {
        const { id } = req.params;

        // Unlink any doctor/employee profile first
        await pool.query('UPDATE doctors SET user_id = NULL WHERE user_id = ?', [id]);
        await pool.query('UPDATE employees SET user_id = NULL WHERE user_id = ?', [id]);
        await pool.query('UPDATE audit_logs SET user_id = NULL WHERE user_id = ?', [id]);

        const [result] = await pool.query('DELETE FROM users WHERE id = ? AND is_active = FALSE', [id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'Pending user not found.' });
        }

        await logAudit(req.user.id, 'USER_REJECTED', 'users', id,
            `Admin rejected and removed pending user ID ${id}`, req);

        return res.json({ success: true, message: 'Pending registration rejected and removed.' });
    } catch (error) {
        console.error('Reject user error:', error);
        return res.status(500).json({ success: false, message: 'Failed to reject user.' });
    }
};

export default { login, register, clearUsers, logout, getMe, getPendingUsers, approveUser, rejectUser, ROLE_DASHBOARDS };
