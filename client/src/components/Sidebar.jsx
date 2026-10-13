import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getRoleDashboard, ROLE_DETAILS } from '../utils/rbacConfig';
import {
    Activity, Users, Calendar, Stethoscope, TestTube2,
    Pill, Receipt, UserCheck, BarChart3, ShieldCheck,
    BedDouble, LogOut, Menu, X, Shield
} from 'lucide-react';

const ALL_NAV_ITEMS = [
    { id: 'patients', label: 'Patient Directory', icon: Users, path: '/patients', roles: ['ADMIN', 'DOCTOR', 'NURSE', 'RECEPTIONIST'] },
    { id: 'appointments', label: 'Appointments', icon: Calendar, path: '/appointments', roles: ['ADMIN', 'DOCTOR', 'RECEPTIONIST'] },
    { id: 'emr', label: 'EMR Consultation', icon: Stethoscope, path: '/emr', roles: ['ADMIN', 'DOCTOR'] },
    { id: 'admissions', label: 'Admissions & Vitals', icon: BedDouble, path: '/admissions', roles: ['ADMIN', 'NURSE', 'DOCTOR'] },
    { id: 'laboratory', label: 'Laboratory Desk', icon: TestTube2, path: '/laboratory', roles: ['ADMIN', 'LAB_STAFF'] },
    { id: 'pharmacy', label: 'Pharmacy & Dispense', icon: Pill, path: '/pharmacy', roles: ['ADMIN', 'PHARMACIST'] },
    { id: 'billing', label: 'Billing & Invoicing', icon: Receipt, path: '/billing', roles: ['ADMIN', 'RECEPTIONIST', 'ACCOUNTANT'] },
    { id: 'staff', label: 'Staff & Attendance', icon: UserCheck, path: '/staff', roles: ['ADMIN', 'ACCOUNTANT'] },
    { id: 'reports', label: 'Reports & Analytics', icon: BarChart3, path: '/reports', roles: ['ADMIN', 'ACCOUNTANT'] },
    { id: 'audit-logs', label: 'Audit Logs & Backup', icon: ShieldCheck, path: '/audit-logs', roles: ['ADMIN'] },
];

export default function Sidebar() {
    const { user, role, logout } = useAuth();
    const location = useLocation();
    const [mobileOpen, setMobileOpen] = useState(false);

    const userRole = role ? String(role).toUpperCase() : '';
    const roleDetails = ROLE_DETAILS[userRole] || { title: userRole || 'Staff', badge: 'bg-slate-700 text-slate-300' };
    const dashboardPath = getRoleDashboard(userRole);

    // Filter permitted navigation items for this role
    const permittedNav = ALL_NAV_ITEMS.filter(item => item.roles.includes(userRole));

    const NavContent = () => (
        <div className="flex flex-col h-full">
            {/* Hospital Branding Header */}
            <div className="p-5 border-b border-slate-800 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-teal-500 to-cyan-400 flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-teal-500/20">
                        🏥
                    </div>
                    <div>
                        <h1 className="font-extrabold text-base tracking-tight text-white">MediCore HMS</h1>
                        <p className="text-[11px] text-teal-400 font-medium">Hospital Management</p>
                    </div>
                </div>
                {mobileOpen && (
                    <button
                        onClick={() => setMobileOpen(false)}
                        className="lg:hidden text-slate-400 hover:text-white"
                    >
                        <X className="w-5 h-5" />
                    </button>
                )}
            </div>

            {/* Authenticated User Profile Card */}
            <div className="px-4 py-3 bg-slate-950/70 border-b border-slate-800">
                <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Authenticated Role</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-semibold border ${roleDetails.badge}`}>
                        {userRole || 'GUEST'}
                    </span>
                </div>
                <p className="text-sm font-semibold text-slate-100 truncate">
                    {user?.full_name || user?.username || 'Hospital Personnel'}
                </p>
                <p className="text-[11px] text-slate-400 truncate font-mono">
                    {user?.email || 'authenticated-user@medicore.org'}
                </p>
            </div>

            {/* Role-Filtered Navigation Links */}
            <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
                {/* Role's Dedicated Dashboard */}
                <Link
                    to={dashboardPath}
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${location.pathname === dashboardPath
                            ? 'bg-gradient-to-r from-teal-600 to-teal-500 text-white shadow-md shadow-teal-600/30'
                            : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                        }`}
                >
                    <Activity className={`w-4 h-4 ${location.pathname === dashboardPath ? 'text-white' : 'text-slate-400'}`} />
                    <span>My Dashboard</span>
                </Link>

                <div className="pt-2 pb-1 px-3">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                        Authorized Modules ({permittedNav.length})
                    </p>
                </div>

                {permittedNav.map(item => {
                    const Icon = item.icon;
                    const isActive = location.pathname === item.path;
                    return (
                        <Link
                            key={item.id}
                            to={item.path}
                            onClick={() => setMobileOpen(false)}
                            className={`flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${isActive
                                    ? 'bg-gradient-to-r from-teal-600 to-teal-500 text-white shadow-md shadow-teal-600/30'
                                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                                }`}
                        >
                            <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                            <span>{item.label}</span>
                        </Link>
                    );
                })}
            </nav>

            {/* User Session Footer with Logout */}
            <div className="p-3 border-t border-slate-800 bg-slate-950/80">
                <button
                    onClick={logout}
                    className="w-full flex items-center justify-center space-x-2 bg-slate-900 hover:bg-rose-950/50 border border-slate-800 hover:border-rose-500/40 text-slate-300 hover:text-rose-300 py-2.5 px-3 rounded-xl text-xs font-semibold transition"
                >
                    <LogOut className="w-4 h-4 text-rose-400" />
                    <span>Sign Out Session</span>
                </button>
            </div>
        </div>
    );

    return (
        <>
            {/* Mobile Header Trigger */}
            <div className="lg:hidden fixed top-3 left-3 z-30">
                <button
                    onClick={() => setMobileOpen(true)}
                    className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-white shadow-lg"
                    aria-label="Open Navigation"
                >
                    <Menu className="w-5 h-5" />
                </button>
            </div>

            {/* Desktop Persistent Sidebar */}
            <aside className="hidden lg:flex w-64 bg-slate-900 text-white flex-col shrink-0 shadow-xl border-r border-slate-800">
                <NavContent />
            </aside>

            {/* Mobile Drawer Overlay */}
            {mobileOpen && (
                <div className="fixed inset-0 z-40 lg:hidden">
                    <div
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm"
                        onClick={() => setMobileOpen(false)}
                    ></div>
                    <div className="fixed inset-y-0 left-0 w-64 bg-slate-900 text-white shadow-2xl z-50">
                        <NavContent />
                    </div>
                </div>
            )}
        </>
    );
}
