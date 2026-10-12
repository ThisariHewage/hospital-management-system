import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
    Activity, Users, Calendar, Stethoscope, TestTube2,
    Pill, Receipt, UserCheck, BarChart3
} from 'lucide-react';

const NAV_ITEMS = [
    { id: 'dashboard', label: 'Dashboard', icon: Activity, path: '/', roles: ['ADMIN', 'DOCTOR', 'NURSE', 'RECEPTIONIST', 'LAB_STAFF', 'PHARMACIST', 'ACCOUNTANT'] },
    { id: 'patients', label: 'Patients', icon: Users, path: '/patients', roles: ['ADMIN', 'DOCTOR', 'NURSE', 'RECEPTIONIST'] },
    { id: 'appointments', label: 'Appointments', icon: Calendar, path: '/appointments', roles: ['ADMIN', 'DOCTOR', 'NURSE', 'RECEPTIONIST'] },
    { id: 'doctors', label: 'Doctors', icon: Stethoscope, path: '/doctors', roles: ['ADMIN', 'RECEPTIONIST', 'DOCTOR'] },
    { id: 'emr', label: 'EMR & Records', icon: Activity, path: '/emr', roles: ['ADMIN', 'DOCTOR', 'NURSE'] },
    { id: 'laboratory', label: 'Laboratory', icon: TestTube2, path: '/laboratory', roles: ['ADMIN', 'LAB_STAFF', 'DOCTOR'] },
    { id: 'pharmacy', label: 'Pharmacy', icon: Pill, path: '/pharmacy', roles: ['ADMIN', 'PHARMACIST', 'DOCTOR'] },
    { id: 'billing', label: 'Billing & Invoices', icon: Receipt, path: '/billing', roles: ['ADMIN', 'ACCOUNTANT', 'RECEPTIONIST'] },
    { id: 'staff', label: 'Staff & Attendance', icon: UserCheck, path: '/staff', roles: ['ADMIN', 'ACCOUNTANT'] },
    { id: 'reports', label: 'Reports & Analytics', icon: BarChart3, path: '/reports', roles: ['ADMIN', 'ACCOUNTANT', 'DOCTOR'] },
];

export default function Sidebar() {
    const { user, role, switchDemoRole } = useAuth();
    const location = useLocation();

    const allowedNav = NAV_ITEMS.filter(item => !role || item.roles.includes(role));

    return (
        <aside className="w-64 bg-slate-900 text-white flex flex-col shrink-0 shadow-xl border-r border-slate-800">
            {/* Brand */}
            <div className="p-5 border-b border-slate-800 flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-teal-500/20">
                    🏥
                </div>
                <div>
                    <h1 className="font-extrabold text-base tracking-tight text-white">MediCore HMS</h1>
                    <p className="text-xs text-slate-400 font-medium">Hospital Management</p>
                </div>
            </div>

            {/* Current User Card */}
            <div className="px-4 py-3 bg-slate-800/60 border-b border-slate-800">
                <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-teal-400">Current Role</span>
                    <span className="text-[10px] bg-teal-500/20 text-teal-300 px-2 py-0.5 rounded-full font-mono font-semibold">
                        {role || 'GUEST'}
                    </span>
                </div>
                <p className="text-sm font-semibold text-slate-200 mt-1 truncate">{user?.title || user?.username || 'User'}</p>
                <p className="text-xs text-slate-400 truncate">{user?.email}</p>
            </div>

            {/* Navigation Items */}
            <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
                {allowedNav.map(item => {
                    const Icon = item.icon;
                    const isActive = location.pathname === item.path;
                    return (
                        <Link
                            key={item.id}
                            to={item.path}
                            className={`flex items-center space-x-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all ${isActive
                                    ? 'bg-teal-600 text-white shadow-md shadow-teal-600/30'
                                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                                }`}
                        >
                            <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                            <span>{item.label}</span>
                        </Link>
                    );
                })}
            </nav>

            {/* Role Persona Switcher for Quick Preview */}
            <div className="p-3 border-t border-slate-800 bg-slate-950/40">
                <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1.5">
                    Switch Demo Persona
                </label>
                <select
                    value={role || 'ADMIN'}
                    onChange={(e) => switchDemoRole(e.target.value)}
                    className="w-full text-xs bg-slate-800 border border-slate-700 rounded-md py-1.5 px-2 text-slate-200 focus:outline-none focus:ring-1 focus:ring-teal-500"
                >
                    <option value="ADMIN">👑 Administrator</option>
                    <option value="DOCTOR">🩺 Doctor (Dr. Smith)</option>
                    <option value="NURSE">💉 Nurse (Joy)</option>
                    <option value="RECEPTIONIST">📋 Receptionist (Alex)</option>
                    <option value="LAB_STAFF">🔬 Laboratory (David)</option>
                    <option value="PHARMACIST">💊 Pharmacist (Emma)</option>
                    <option value="ACCOUNTANT">💳 Accountant (Marcus)</option>
                </select>
            </div>
        </aside>
    );
}
