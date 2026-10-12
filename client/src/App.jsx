import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './pages/Dashboard';
import {
    Users, Calendar, Stethoscope, Activity, TestTube2,
    Pill, Receipt, UserCheck, BarChart3
} from 'lucide-react';

function Layout({ children }) {
    return (
        <div className="min-h-screen flex bg-slate-100/70 text-slate-800">
            <Sidebar />
            <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
                <Header />
                <div className="p-8 flex-1">
                    {children}
                </div>
            </main>
        </div>
    );
}

function PlaceholderPage({ title, description, icon: Icon }) {
    return (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-8 shadow-sm max-w-4xl">
            <div className="flex items-center space-x-3 mb-3">
                <div className="p-2.5 rounded-xl bg-teal-50 text-teal-600">
                    <Icon className="w-6 h-6" />
                </div>
                <div>
                    <h2 className="text-xl font-bold text-slate-900">{title}</h2>
                    <p className="text-xs text-slate-500">{description}</p>
                </div>
            </div>
            <div className="mt-6 p-6 rounded-xl bg-slate-50 border border-dashed border-slate-300 text-sm text-slate-500">
                Ready for domain implementation in the subsequent step.
            </div>
        </div>
    );
}

export default function App() {
    return (
        <BrowserRouter>
            <Layout>
                <Routes>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/patients" element={<PlaceholderPage title="Patient Management" description="Register, search, view history, and manage patient files." icon={Users} />} />
                    <Route path="/appointments" element={<PlaceholderPage title="Appointment Scheduling" description="Doctor schedules, calendar views, and booking management." icon={Calendar} />} />
                    <Route path="/doctors" element={<PlaceholderPage title="Doctor Directory" description="Doctors, departmental assignments, and consultation fees." icon={Stethoscope} />} />
                    <Route path="/emr" element={<PlaceholderPage title="Electronic Medical Records (EMR)" description="Clinical diagnoses, vitals, prescriptions, and treatment plans." icon={Activity} />} />
                    <Route path="/laboratory" element={<PlaceholderPage title="Laboratory Management" description="Lab test requests, sample collections, and result entry." icon={TestTube2} />} />
                    <Route path="/pharmacy" element={<PlaceholderPage title="Pharmacy & Stock" description="Medicine inventory, expiry monitoring, and prescription dispensing." icon={Pill} />} />
                    <Route path="/billing" element={<PlaceholderPage title="Billing & Invoicing" description="Unified hospital billing, payment recording, and printable receipts." icon={Receipt} />} />
                    <Route path="/staff" element={<PlaceholderPage title="Staff Management" description="Employee registry, daily attendance, and leave management." icon={UserCheck} />} />
                    <Route path="/reports" element={<PlaceholderPage title="Reports & Analytics" description="Clinical, financial, and operational analytical reports." icon={BarChart3} />} />
                </Routes>
            </Layout>
        </BrowserRouter>
    );
}
