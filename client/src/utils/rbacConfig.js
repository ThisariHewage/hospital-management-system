/**
 * Centralized Role-Based Access Control (RBAC) Configuration
 * Defines all 7 hospital roles, route mappings, permissions, and metadata.
 */

export const ROLES = {
    ADMIN: 'ADMIN',
    DOCTOR: 'DOCTOR',
    NURSE: 'NURSE',
    RECEPTIONIST: 'RECEPTIONIST',
    LAB_STAFF: 'LAB_STAFF',
    PHARMACIST: 'PHARMACIST',
    ACCOUNTANT: 'ACCOUNTANT'
};

/**
 * Centralized Role-to-Dashboard route mapping as required
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
 * Helper to retrieve the dashboard route for a given role
 */
export const getRoleDashboard = (role) => {
    if (!role) return '/login';
    const normalizedRole = String(role).toUpperCase();
    return ROLE_DASHBOARDS[normalizedRole] || '/admin/dashboard';
};

/**
 * Metadata for each role (titles, badges, colors)
 */
export const ROLE_DETAILS = {
    ADMIN: {
        title: 'System Administrator',
        badge: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
        accent: 'from-purple-600 to-indigo-600',
        description: 'Full administrative authority over users, departments, and system configurations.'
    },
    DOCTOR: {
        title: 'Medical Doctor',
        badge: 'bg-teal-500/20 text-teal-300 border-teal-500/30',
        accent: 'from-teal-600 to-cyan-600',
        description: 'Clinical consultation, diagnoses, prescriptions, and lab test orders.'
    },
    NURSE: {
        title: 'Head Nurse / Inpatient Care',
        badge: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
        accent: 'from-rose-500 to-pink-600',
        description: 'Inpatient ward monitoring, bed allocations, and clinical vital sign tracking.'
    },
    RECEPTIONIST: {
        title: 'Front Desk Receptionist',
        badge: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
        accent: 'from-amber-500 to-orange-600',
        description: 'Patient registrations, appointment scheduling, and front-desk coordination.'
    },
    LAB_STAFF: {
        title: 'Laboratory Technologist',
        badge: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
        accent: 'from-blue-600 to-cyan-600',
        description: 'Diagnostic specimen processing, pathology testing, and verified lab results entry.'
    },
    PHARMACIST: {
        title: 'Chief Pharmacist',
        badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
        accent: 'from-emerald-600 to-teal-600',
        description: 'Drug inventory monitoring, low-stock alerts, and prescription dispensing queue.'
    },
    ACCOUNTANT: {
        title: 'Finance & Accounts Officer',
        badge: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
        accent: 'from-indigo-600 to-blue-600',
        description: 'Billing invoices, payment settlements, revenue collection, and payroll analytics.'
    }
};

/**
 * Page access permission matrix: maps pages to allowed roles
 */
export const PAGE_PERMISSIONS = {
    '/patients': ['ADMIN', 'DOCTOR', 'NURSE', 'RECEPTIONIST'],
    '/appointments': ['ADMIN', 'DOCTOR', 'RECEPTIONIST'],
    '/emr': ['ADMIN', 'DOCTOR'],
    '/admissions': ['ADMIN', 'NURSE', 'DOCTOR'],
    '/laboratory': ['ADMIN', 'LAB_STAFF'],
    '/pharmacy': ['ADMIN', 'PHARMACIST'],
    '/billing': ['ADMIN', 'RECEPTIONIST', 'ACCOUNTANT'],
    '/staff': ['ADMIN', 'ACCOUNTANT'],
    '/reports': ['ADMIN', 'ACCOUNTANT'],
    '/audit-logs': ['ADMIN']
};

export default {
    ROLES,
    ROLE_DASHBOARDS,
    getRoleDashboard,
    ROLE_DETAILS,
    PAGE_PERMISSIONS
};
