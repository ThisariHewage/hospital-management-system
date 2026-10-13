/**
 * Input validator for Authentication endpoints
 */

export const ALLOWED_ROLES = [
    'ADMIN',
    'DOCTOR',
    'NURSE',
    'RECEPTIONIST',
    'LAB_STAFF',
    'PHARMACIST',
    'ACCOUNTANT'
];

export const validateLoginInput = (data) => {
    const errors = {};
    const identifier = data.username || data.email;
    const password = data.password;
    const role = data.role ? String(data.role).toUpperCase().trim() : null;

    if (!identifier || typeof identifier !== 'string' || !identifier.trim()) {
        errors.username = 'Username is required.';
    }

    if (!password || typeof password !== 'string' || !password.trim()) {
        errors.password = 'Password is required.';
    } else if (password.length < 4) {
        errors.password = 'Password must be at least 4 characters.';
    }

    if (role && !ALLOWED_ROLES.includes(role)) {
        errors.role = `Invalid role '${role}'. Must be one of: ${ALLOWED_ROLES.join(', ')}`;
    }

    return {
        isValid: Object.keys(errors).length === 0,
        errors,
        cleanData: {
            identifier: identifier ? identifier.trim() : '',
            password: password ? password.trim() : '',
            role: role || null
        }
    };
};

export default {
    ALLOWED_ROLES,
    validateLoginInput
};
