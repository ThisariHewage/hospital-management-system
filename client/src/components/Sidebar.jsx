import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
    Activity, Users, Calendar, Stethoscope, TestTube2,
    Pill, Receipt, UserCheck, BarChart3, ShieldCheck,
    BedDouble, ClipboardList, LogOut
} from 'lucide-react';

const NAV_ITEMS = [
    { id: 'dashboard', label: 'Dashboard', icon: Activity, path: '/', roles: ['ADMIN', 'DOCTOR', 'NURSE', 'RECEPTIONIST', 'LAB_STAFF', 'PHARMACIST', 'ACCOUNTANT'] },
    { id: 'patients', label: 'Patient Directory', icon: Users, path: '/patients', roles: ['ADMIN', 'DOCTOR', 'NURSE', 'RECEPTIONIST'] },
    { id: 'appointments', label: 'Appointments', icon: Calendar, path: '/appointments', roles: ['ADMIN', 'DOCTOR', 'RECEPTIONIST'] },
    { id: 'emr', label: 'EMR Consultation', icon: Stethoscope, path: '/emr', roles: ['ADMIN', 'DOCTOR'] },
    { id: 'admissions', label: 'Admissions & Vitals', icon: BedDouble, path: '/admissions', roles: ['ADMIN', 'NURSE'] },
    { id: 'laboratory', label: 'Laboratory Desk', icon: TestTube2, path: '/laboratory', roles: ['ADMIN', 'LAB_STAFF'] },
    { id: 'pharmacy', label: 'Pharmacy & Dispense', icon: Pill, path: '/pharmacy', roles: ['ADMIN', 'PHARMACIST'] },
    { id: 'billing', label: 'Billing & Invoicing', icon: Receipt, path: '/billing', roles: ['ADMIN', 'RECEPTIONIST', 'ACCOUNTANT'] },
    { id: 'staff', label: 'Staff & Attendance', icon: UserCheck, path: '/staff', roles: ['ADMIN', 'ACCOUNTANT'] },
    { id: 'reports', label: 'Reports & Analytics', icon: BarChart3, path: '/reports', roles: ['ADMIN', 'ACCOUNTANT'] },
    { id: 'audit-logs', label: 'Audit Logs & Backup', icon: ShieldCheck, path: '/audit-logs', roles: ['ADMIN'] },
];

export default function Sidebar() {
    const { user, role, switchDemoRole, logout } = useAuth();
    const location = useLocation();

    const allowedNav = NAV_ITEMS.filter(item => !role || item.roles.includes(role));

    return (
        <aside className="w-64 bg-slate-900 text-white flex flex-col shrink-0 shadow-xl border-r border-slate-800">
            {/* Brand Header */}
            <div className="p-5 border-b border-slate-800 flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-teal-500 to-cyan-400 flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-teal-500/20">
                    🏥
                </div>
                <div>
                    <h1 className="font-extrabold text-base tracking-tight text-white">MediCore HMS</h1>
                    <p className="text-xs text-teal-400 font-medium">Hospital Management</p>
                </div>
            </div>

            {/* Current Active Persona Card */}
            <div className="px-4 py-3 bg-slate-800/60 border-b border-slate-800">
                <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-teal-400">Active Role</span>
                    <span className="text-[10px] bg-teal-500/20 text-teal-300 px-2 py-0.5 rounded-full font-mono font-semibold">
                        {role || 'GUEST'}
                    </span>
                </div>
                <p className="text-sm font-semibold text-slate-100 mt-1 truncate">{user?.username || user?.full_name || 'Staff'}</p>
                <p className="text-xs text-slate-400 truncate">{user?.email || 'hospital-staff@medicore.org'}</p>
            </div>

            {/* Role-Filtered Navigation */}
            <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
                {allowedNav.map(item => {
                    const Icon = item.icon;
                    const isActive = location.pathname === item.path;
                    return (
                        <Link
                            key={item.id}
                            to={item.path}
                            className={`flex items-center space-x-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all ${isActive
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

            {/* Quick Demo Role Switcher */}
            <div className="p-3 border-t border-slate-800 bg-slate-950/60 space-y-2">
                <div className="flex items-center justify-between">
                    <label className="text-[10px] uppercase font-bold text-slate-400">
                        Demo Role Switcher
                    </label>
                    <button
                        onClick={logout}
                        title="Sign Out"
                        className="text-slate-400 hover:text-rose-400 transition"
                    >
                        <LogOut className="w-3.5 h-3.5" />
                    </button>
                </div>
                <select
                    value={role || 'ADMIN'}
                    onChange={(e) => switchDemoRole(e.target.value)}
                    className="w-full text-xs bg-slate-800 border border-slate-700 rounded-md py-1.5 px-2 text-slate-200 focus:outline-none focus:ring-1 focus:ring-teal-500 font-medium cursor-pointer"
                >
                    <option value="ADMIN">👑 Administrator (Full Access)</option>
                    <option value="DOCTOR">🩺 Doctor (Appointments, EMR)</option>
                    <option value="NURSE">💉 Nurse (Admissions, Vitals)</option>
                    <option value="RECEPTIONIST">📋 Receptionist (Registration, Appointments)</option>
                    <option value="LAB_STAFF">🔬 Lab Staff (Tests & Results)</option>
                    <option value="PHARMACIST">💊 Pharmacist (Inventory & Dispense)</option>
                    <option value="ACCOUNTANT">💳 Accountant (Billing & Reports)</option>
                </select>
            </div>
        </aside>
    );
}
