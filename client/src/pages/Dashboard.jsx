import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
    Users, Calendar, Receipt, AlertTriangle, Activity,
    Clock, Shield, ArrowUpRight, CheckCircle2, Stethoscope,
    BedDouble, TestTube2, Pill, UserCheck, HardDrive
} from 'lucide-react';

export default function Dashboard() {
    const { user, role } = useAuth();

    return (
        <div className="space-y-6 max-w-7xl mx-auto">
            {/* Welcome Banner */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-teal-900 via-teal-800 to-slate-900 p-6 md:p-8 rounded-2xl text-white shadow-xl">
                <div>
                    <span className="text-xs uppercase tracking-widest text-teal-300 font-bold">MediCore Operational Console</span>
                    <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight mt-1">Welcome back, {user?.title || user?.username}!</h2>
                    <p className="text-sm text-teal-100/80 mt-1 max-w-xl">
                        Integrated Clinical, Administrative & Financial Workspace with a real-time RBAC session.
                    </p>
                </div>
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                    <span className="inline-flex items-center px-3.5 py-1.5 rounded-xl text-xs font-bold bg-white/10 text-white backdrop-blur-md border border-white/20">
                        <Shield className="w-3.5 h-3.5 mr-1.5 text-teal-300" />
                        Role: {role}
                    </span>
                </div>
            </div>

            {/* Role-tailored Quick Actions */}
            <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Quick Departmental Navigation</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                    {['ADMIN', 'DOCTOR', 'NURSE', 'RECEPTIONIST'].includes(role) && (
                        <Link to="/patients" className="p-3.5 bg-white rounded-xl border border-slate-200/80 hover:border-teal-500 hover:shadow-sm transition flex flex-col items-center text-center group">
                            <div className="p-2 rounded-lg bg-teal-50 text-teal-600 group-hover:bg-teal-600 group-hover:text-white transition">
                                <Users className="w-5 h-5" />
                            </div>
                            <span className="text-xs font-bold text-slate-800 mt-2">Patients</span>
                        </Link>
                    )}
                    {['ADMIN', 'DOCTOR', 'RECEPTIONIST'].includes(role) && (
                        <Link to="/appointments" className="p-3.5 bg-white rounded-xl border border-slate-200/80 hover:border-teal-500 hover:shadow-sm transition flex flex-col items-center text-center group">
                            <div className="p-2 rounded-lg bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition">
                                <Calendar className="w-5 h-5" />
                            </div>
                            <span className="text-xs font-bold text-slate-800 mt-2">Appointments</span>
                        </Link>
                    )}
                    {['ADMIN', 'DOCTOR'].includes(role) && (
                        <Link to="/emr" className="p-3.5 bg-white rounded-xl border border-slate-200/80 hover:border-teal-500 hover:shadow-sm transition flex flex-col items-center text-center group">
                            <div className="p-2 rounded-lg bg-rose-50 text-rose-600 group-hover:bg-rose-600 group-hover:text-white transition">
                                <Stethoscope className="w-5 h-5" />
                            </div>
                            <span className="text-xs font-bold text-slate-800 mt-2">EMR Desk</span>
                        </Link>
                    )}
                    {['ADMIN', 'NURSE'].includes(role) && (
                        <Link to="/admissions" className="p-3.5 bg-white rounded-xl border border-slate-200/80 hover:border-teal-500 hover:shadow-sm transition flex flex-col items-center text-center group">
                            <div className="p-2 rounded-lg bg-amber-50 text-amber-600 group-hover:bg-amber-600 group-hover:text-white transition">
                                <BedDouble className="w-5 h-5" />
                            </div>
                            <span className="text-xs font-bold text-slate-800 mt-2">Admissions</span>
                        </Link>
                    )}
                    {['ADMIN', 'LAB_STAFF'].includes(role) && (
                        <Link to="/laboratory" className="p-3.5 bg-white rounded-xl border border-slate-200/80 hover:border-teal-500 hover:shadow-sm transition flex flex-col items-center text-center group">
                            <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition">
                                <TestTube2 className="w-5 h-5" />
                            </div>
                            <span className="text-xs font-bold text-slate-800 mt-2">Laboratory</span>
                        </Link>
                    )}
                    {['ADMIN', 'PHARMACIST'].includes(role) && (
                        <Link to="/pharmacy" className="p-3.5 bg-white rounded-xl border border-slate-200/80 hover:border-teal-500 hover:shadow-sm transition flex flex-col items-center text-center group">
                            <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition">
                                <Pill className="w-5 h-5" />
                            </div>
                            <span className="text-xs font-bold text-slate-800 mt-2">Pharmacy</span>
                        </Link>
                    )}
                    {['ADMIN', 'RECEPTIONIST', 'ACCOUNTANT'].includes(role) && (
                        <Link to="/billing" className="p-3.5 bg-white rounded-xl border border-slate-200/80 hover:border-teal-500 hover:shadow-sm transition flex flex-col items-center text-center group">
                            <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition">
                                <Receipt className="w-5 h-5" />
                            </div>
                            <span className="text-xs font-bold text-slate-800 mt-2">Billing</span>
                        </Link>
                    )}
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between text-slate-500 mb-3">
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Registered Patients</span>
                        <div className="p-2 rounded-lg bg-teal-50 text-teal-600">
                            <Users className="w-5 h-5" />
                        </div>
                    </div>
                    <div className="text-3xl font-extrabold text-slate-900">1,248</div>
                    <div className="flex items-center text-xs text-emerald-600 mt-2 font-medium">
                        <span className="mr-1">↑ 12%</span> vs last month
                    </div>
                </div>

                <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between text-slate-500 mb-3">
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Scheduled Appointments</span>
                        <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
                            <Calendar className="w-5 h-5" />
                        </div>
                    </div>
                    <div className="text-3xl font-extrabold text-slate-900">42</div>
                    <div className="flex items-center text-xs text-blue-600 mt-2 font-medium">
                        <span className="mr-1">8 Scheduled</span> • 4 Completed
                    </div>
                </div>

                <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between text-slate-500 mb-3">
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Billed / Revenue</span>
                        <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600">
                            <Receipt className="w-5 h-5" />
                        </div>
                    </div>
                    <div className="text-3xl font-extrabold text-slate-900">$58,420</div>
                    <div className="flex items-center text-xs text-emerald-600 mt-2 font-medium">
                        <span className="mr-1">↑ 18.4%</span> net earnings
                    </div>
                </div>

                <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between text-slate-500 mb-3">
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Active Bed Occupancy</span>
                        <div className="p-2 rounded-lg bg-amber-50 text-amber-600">
                            <BedDouble className="w-5 h-5" />
                        </div>
                    </div>
                    <div className="text-3xl font-extrabold text-slate-900">14 / 42</div>
                    <div className="flex items-center text-xs text-amber-600 mt-2 font-medium">
                        <span className="mr-1">33% capacity</span> • 28 beds available
                    </div>
                </div>
            </div>

            {/* Clinical & Operational Status Feed */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Consultations */}
                <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-bold text-slate-800 text-sm flex items-center space-x-2">
                            <Activity className="w-4 h-4 text-teal-600" />
                            <span>Recent Clinical Activity</span>
                        </h3>
                        <Link to="/patients" className="text-xs text-teal-600 font-semibold hover:underline">View All</Link>
                    </div>
                    <div className="space-y-3">
                        <div className="p-3 bg-slate-50 rounded-xl flex items-center justify-between">
                            <div>
                                <p className="text-xs font-bold text-slate-800">James Wilson (PAT-2026-0001)</p>
                                <p className="text-[11px] text-slate-500">Dr. Robert Smith • Cardiology Consultation</p>
                            </div>
                            <span className="text-[10px] font-semibold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">Completed</span>
                        </div>
                        <div className="p-3 bg-slate-50 rounded-xl flex items-center justify-between">
                            <div>
                                <p className="text-xs font-bold text-slate-800">Eleanor Rigby (PAT-2026-0002)</p>
                                <p className="text-[11px] text-slate-500">Dr. Sarah Jenkins • Pediatrics Follow-up</p>
                            </div>
                            <span className="text-[10px] font-semibold bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">Scheduled</span>
                        </div>
                        <div className="p-3 bg-slate-50 rounded-xl flex items-center justify-between">
                            <div>
                                <p className="text-xs font-bold text-slate-800">Sophia Martinez (PAT-2026-0004)</p>
                                <p className="text-[11px] text-slate-500">Ward ICU-04 • Vitals Checked (BP 120/78)</p>
                            </div>
                            <span className="text-[10px] font-semibold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full">Inpatient</span>
                        </div>
                    </div>
                </div>

                {/* System & Inventory Alerts */}
                <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-bold text-slate-800 text-sm flex items-center space-x-2">
                            <AlertTriangle className="w-4 h-4 text-amber-500" />
                            <span>System & Inventory Alerts</span>
                        </h3>
                        <Link to="/pharmacy" className="text-xs text-teal-600 font-semibold hover:underline">Check Stock</Link>
                    </div>
                    <div className="space-y-3">
                        <div className="p-3 bg-rose-50 border border-rose-100 rounded-xl flex items-center justify-between">
                            <div>
                                <p className="text-xs font-bold text-rose-900">Metformin 850mg Stock Critical</p>
                                <p className="text-[11px] text-rose-700">Only 5 units remaining (Min threshold: 20 units)</p>
                            </div>
                            <Link to="/pharmacy" className="text-xs font-bold text-rose-700 bg-rose-100 px-2 py-1 rounded hover:bg-rose-200">Reorder</Link>
                        </div>
                        <div className="p-3 bg-amber-50 border border-amber-100 rounded-xl flex items-center justify-between">
                            <div>
                                <p className="text-xs font-bold text-amber-900">Paracetamol 650mg Low Stock</p>
                                <p className="text-[11px] text-amber-700">8 units remaining (Min threshold: 25 units)</p>
                            </div>
                            <Link to="/pharmacy" className="text-xs font-bold text-amber-700 bg-amber-100 px-2 py-1 rounded hover:bg-amber-200">Reorder</Link>
                        </div>
                        <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-xl flex items-center justify-between">
                            <div>
                                <p className="text-xs font-bold text-emerald-900">Daily Automated Backup Ready</p>
                                <p className="text-[11px] text-emerald-700">All tables verified and synced with audit log</p>
                            </div>
                            <span className="text-[10px] font-semibold text-emerald-700">Optimal</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
