import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Sidebar from './components/Sidebar';
import Header from './components/Header';

// Pages
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Patients from './pages/Patients';
import Appointments from './pages/Appointments';
import EMR from './pages/EMR';
import Admissions from './pages/Admissions';
import Laboratory from './pages/Laboratory';
import Pharmacy from './pages/Pharmacy';
import Billing from './pages/Billing';
import Staff from './pages/Staff';
import Reports from './pages/Reports';
import AuditLogs from './pages/AuditLogs';

function Layout({ children }) {
    return (
        <div className="min-h-screen flex bg-slate-100/70 text-slate-800">
            <Sidebar />
            <main className="flex-1 flex flex-col min-w-0 overflow-y-auto h-screen">
                <Header />
                <div className="p-6 md:p-8 flex-1 overflow-y-auto">
                    {children}
                </div>
            </main>
        </div>
    );
}

export default function App() {
    const { user } = useAuth();

    return (
        <BrowserRouter>
            <Routes>
                {/* Public / Auth Route */}
                <Route path="/login" element={<Login />} />

                {/* Authenticated Workspace Routes */}
                <Route
                    path="/*"
                    element={
                        user ? (
                            <Layout>
                                <Routes>
                                    <Route path="/" element={<Dashboard />} />
                                    <Route path="/patients" element={<Patients />} />
                                    <Route path="/appointments" element={<Appointments />} />
                                    <Route path="/emr" element={<EMR />} />
                                    <Route path="/admissions" element={<Admissions />} />
                                    <Route path="/laboratory" element={<Laboratory />} />
                                    <Route path="/pharmacy" element={<Pharmacy />} />
                                    <Route path="/billing" element={<Billing />} />
                                    <Route path="/staff" element={<Staff />} />
                                    <Route path="/reports" element={<Reports />} />
                                    <Route path="/audit-logs" element={<AuditLogs />} />
                                    {/* Fallback */}
                                    <Route path="*" element={<Navigate to="/" replace />} />
                                </Routes>
                            </Layout>
                        ) : (
                            <Navigate to="/login" replace />
                        )
                    }
                />
            </Routes>
        </BrowserRouter>
    );
}
