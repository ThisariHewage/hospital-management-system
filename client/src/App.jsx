import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { getRoleDashboard } from './utils/rbacConfig';
import ProtectedRoute from './components/ProtectedRoute';
import RoleBasedRoute from './components/RoleBasedRoute';
import Sidebar from './components/Sidebar';
import Header from './components/Header';

// Authentication & Public Pages
import Login from './pages/Login';
import LandingPage from './pages/LandingPage';

// 7 Dedicated Role Dashboards
import {
    AdminDashboard,
    DoctorDashboard,
    NurseDashboard,
    ReceptionistDashboard,
    LabDashboard,
    PharmacyDashboard,
    AccountantDashboard
} from './pages/RoleDashboards';

// Domain Operational Pages
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

/**
 * Common Workspace Layout
 */
function Layout({ children }) {
    return (
        <div className="min-h-screen flex bg-slate-100/70 text-slate-800">
            <Sidebar />
            <main className="flex-1 flex flex-col min-w-0 overflow-y-auto h-screen">
                <Header />
                <div className="p-4 sm:p-6 md:p-8 flex-1 overflow-y-auto">
                    {children}
                </div>
            </main>
        </div>
    );
}

/**
 * Root Redirector: Automatically navigates the authenticated user to their role's dashboard
 */
function RootDashboardRedirect() {
    const { user } = useAuth();
    const destination = getRoleDashboard(user?.role);
    return <Navigate to={destination} replace />;
}

/**
 * Public root: show landing page for guests, redirect authenticated users to their dashboard
 */
function PublicLandingRoute() {
    const { isAuthenticated, user } = useAuth();
    if (isAuthenticated && user?.role) {
        return <Navigate to={getRoleDashboard(user.role)} replace />;
    }
    return <LandingPage />;
}

export default function App() {
    return (
        <BrowserRouter>
            <Routes>
                {/* Public Landing Page */}
                <Route path="/" element={<PublicLandingRoute />} />

                {/* Public Authentication Route */}
                <Route path="/login" element={<Login />} />

                {/* All Authenticated & Role-Protected Routes */}
                <Route
                    path="/*"
                    element={
                        <ProtectedRoute>
                            <Layout>
                                <Routes>
                                    {/* Automatic Root Redirection to Assigned Role Dashboard */}
                                    <Route path="/" element={<RootDashboardRedirect />} />

                                    {/* 7 Dedicated Role Dashboards */}
                                    <Route
                                        path="/admin/dashboard"
                                        element={
                                            <RoleBasedRoute allowedRoles={['ADMIN']}>
                                                <AdminDashboard />
                                            </RoleBasedRoute>
                                        }
                                    />
                                    <Route
                                        path="/doctor/dashboard"
                                        element={
                                            <RoleBasedRoute allowedRoles={['DOCTOR']}>
                                                <DoctorDashboard />
                                            </RoleBasedRoute>
                                        }
                                    />
                                    <Route
                                        path="/nurse/dashboard"
                                        element={
                                            <RoleBasedRoute allowedRoles={['NURSE']}>
                                                <NurseDashboard />
                                            </RoleBasedRoute>
                                        }
                                    />
                                    <Route
                                        path="/receptionist/dashboard"
                                        element={
                                            <RoleBasedRoute allowedRoles={['RECEPTIONIST']}>
                                                <ReceptionistDashboard />
                                            </RoleBasedRoute>
                                        }
                                    />
                                    <Route
                                        path="/laboratory/dashboard"
                                        element={
                                            <RoleBasedRoute allowedRoles={['LAB_STAFF']}>
                                                <LabDashboard />
                                            </RoleBasedRoute>
                                        }
                                    />
                                    <Route
                                        path="/pharmacy/dashboard"
                                        element={
                                            <RoleBasedRoute allowedRoles={['PHARMACIST']}>
                                                <PharmacyDashboard />
                                            </RoleBasedRoute>
                                        }
                                    />
                                    <Route
                                        path="/accountant/dashboard"
                                        element={
                                            <RoleBasedRoute allowedRoles={['ACCOUNTANT']}>
                                                <AccountantDashboard />
                                            </RoleBasedRoute>
                                        }
                                    />

                                    {/* Clinical & Administrative Domain Modules */}
                                    <Route
                                        path="/patients"
                                        element={
                                            <RoleBasedRoute allowedRoles={['ADMIN', 'DOCTOR', 'NURSE', 'RECEPTIONIST']}>
                                                <Patients />
                                            </RoleBasedRoute>
                                        }
                                    />
                                    <Route
                                        path="/appointments"
                                        element={
                                            <RoleBasedRoute allowedRoles={['ADMIN', 'DOCTOR', 'RECEPTIONIST']}>
                                                <Appointments />
                                            </RoleBasedRoute>
                                        }
                                    />
                                    <Route
                                        path="/emr"
                                        element={
                                            <RoleBasedRoute allowedRoles={['ADMIN', 'DOCTOR']}>
                                                <EMR />
                                            </RoleBasedRoute>
                                        }
                                    />
                                    <Route
                                        path="/admissions"
                                        element={
                                            <RoleBasedRoute allowedRoles={['ADMIN', 'NURSE', 'DOCTOR']}>
                                                <Admissions />
                                            </RoleBasedRoute>
                                        }
                                    />
                                    <Route
                                        path="/laboratory"
                                        element={
                                            <RoleBasedRoute allowedRoles={['ADMIN', 'LAB_STAFF']}>
                                                <Laboratory />
                                            </RoleBasedRoute>
                                        }
                                    />
                                    <Route
                                        path="/pharmacy"
                                        element={
                                            <RoleBasedRoute allowedRoles={['ADMIN', 'PHARMACIST']}>
                                                <Pharmacy />
                                            </RoleBasedRoute>
                                        }
                                    />
                                    <Route
                                        path="/billing"
                                        element={
                                            <RoleBasedRoute allowedRoles={['ADMIN', 'RECEPTIONIST', 'ACCOUNTANT']}>
                                                <Billing />
                                            </RoleBasedRoute>
                                        }
                                    />
                                    <Route
                                        path="/staff"
                                        element={
                                            <RoleBasedRoute allowedRoles={['ADMIN', 'ACCOUNTANT']}>
                                                <Staff />
                                            </RoleBasedRoute>
                                        }
                                    />
                                    <Route
                                        path="/reports"
                                        element={
                                            <RoleBasedRoute allowedRoles={['ADMIN', 'ACCOUNTANT']}>
                                                <Reports />
                                            </RoleBasedRoute>
                                        }
                                    />
                                    <Route
                                        path="/audit-logs"
                                        element={
                                            <RoleBasedRoute allowedRoles={['ADMIN']}>
                                                <AuditLogs />
                                            </RoleBasedRoute>
                                        }
                                    />

                                    {/* Fallback to user's dashboard */}
                                    <Route path="*" element={<RootDashboardRedirect />} />
                                </Routes>
                            </Layout>
                        </ProtectedRoute>
                    }
                />
            </Routes>
        </BrowserRouter>
    );
}
