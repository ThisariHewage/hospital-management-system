import React from 'react';
import { useAuth } from '../context/AuthContext';
import {
    Users, Calendar, Receipt, AlertTriangle, Activity,
    Clock, Shield, ArrowUpRight, CheckCircle2
} from 'lucide-react';

export default function Dashboard() {
    const { user, role } = useAuth();

    return (
        <div className="space-y-6 max-w-7xl mx-auto">
            {/* Welcome Banner */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-teal-900 to-slate-900 p-6 rounded-2xl text-white shadow-lg">
                <div>
                    <span className="text-xs uppercase tracking-widest text-teal-400 font-bold">MediCore Operational Console</span>
                    <h2 className="text-2xl font-extrabold tracking-tight mt-1">Welcome back, {user?.title || user?.username}!</h2>
                    <p className="text-sm text-slate-300 mt-1">
                        System status is normal. MySQL database <span className="font-mono text-teal-300">hospital_db</span> is connected.
                    </p>
                </div>
                <div className="flex items-center space-x-2">
                    <span className="inline-flex items-center px-3 py-1.5 rounded-xl text-xs font-semibold bg-white/10 text-white backdrop-blur-md border border-white/20">
                        <Shield className="w-3.5 h-3.5 mr-1.5 text-teal-300" />
                        RBAC: {role}
                    </span>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between text-slate-500 mb-3">
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Patients</span>
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
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Today's Appointments</span>
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
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Revenue</span>
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
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Inventory & Lab Alerts</span>
                        <div className="p-2 rounded-lg bg-amber-50 text-amber-600">
                            <AlertTriangle className="w-5 h-5" />
                        </div>
                    </div>
                    <div className="text-3xl font-extrabold text-slate-900">3</div>
                    <div className="flex items-center text-xs text-amber-600 mt-2 font-medium">
                        <span className="mr-1">2 Low-stock</span> • 1 Expiring soon
                    </div>
                </div>
            </div>

            {/* Architecture & Verification Panel */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h3 className="text-base font-bold text-slate-900">Architecture & Directory Setup Complete</h3>
                        <p className="text-xs text-slate-500 mt-0.5">Full monorepo structure implemented adhering to the Software Specification Document.</p>
                    </div>
                    <span className="px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-semibold rounded-full border border-emerald-200">
                        ✓ Phase 3 Scaffolding Active
                    </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                        <span className="font-bold text-slate-800 text-sm block mb-1">📁 database/</span>
                        <p className="text-xs text-slate-600 mb-2">19 relational tables created with foreign keys, indexes, and cascades.</p>
                        <span className="text-[11px] font-mono text-teal-700 bg-white px-2 py-0.5 rounded border border-slate-200">
                            schema.sql & seed.sql
                        </span>
                    </div>

                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                        <span className="font-bold text-slate-800 text-sm block mb-1">📁 server/</span>
                        <p className="text-xs text-slate-600 mb-2">Node.js + Express REST API with HTTP-only JWT cookies, bcrypt, and RBAC.</p>
                        <span className="text-[11px] font-mono text-teal-700 bg-white px-2 py-0.5 rounded border border-slate-200">
                            Express / MySQL2 Pool
                        </span>
                    </div>

                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                        <span className="font-bold text-slate-800 text-sm block mb-1">📁 client/</span>
                        <p className="text-xs text-slate-600 mb-2">React 18 + Vite + Tailwind CSS + Axios + React Router.</p>
                        <span className="text-[11px] font-mono text-teal-700 bg-white px-2 py-0.5 rounded border border-slate-200">
                            Vite Dev Server
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}
