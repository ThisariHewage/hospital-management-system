import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Activity } from 'lucide-react';

/**
 * ProtectedRoute:
 * Enforces authentication. Renders children only if user is logged in.
 * Shows a medical-themed loading screen while checking session with /api/auth/me.
 * Redirects unauthenticated users to /login preserving the requested location.
 */
export default function ProtectedRoute({ children }) {
    const { isAuthenticated, loading } = useAuth();
    const location = useLocation();

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
                <div className="relative flex items-center justify-center">
                    <div className="w-16 h-16 border-4 border-teal-500/20 border-t-teal-400 rounded-full animate-spin"></div>
                    <Activity className="w-6 h-6 text-teal-400 absolute animate-pulse" />
                </div>
                <h3 className="mt-4 text-base font-semibold text-slate-200 tracking-wide">
                    MediCore Clinical Portal
                </h3>
                <p className="mt-1 text-xs text-slate-400">
                    Verifying security credentials & role permissions...
                </p>
            </div>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    return children;
}
