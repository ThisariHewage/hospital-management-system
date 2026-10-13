import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getRoleDashboard, ROLE_DETAILS } from '../utils/rbacConfig';
import { ShieldAlert, ArrowLeft, Lock } from 'lucide-react';

/**
 * RoleBasedRoute:
 * Enforces role-based authorization.
 * If the authenticated user's role is not within `allowedRoles`,
 * renders an explicit Access Denied (HTTP 403 Forbidden) warning card
 * preventing unauthorized cross-role access and providing a quick link back to their dashboard.
 */
export default function RoleBasedRoute({ allowedRoles = [], children }) {
    const { user, role } = useAuth();
    const navigate = useNavigate();

    const normalizedAllowed = Array.isArray(allowedRoles)
        ? allowedRoles.map(r => String(r).toUpperCase())
        : [String(allowedRoles).toUpperCase()];

    const userRole = role ? String(role).toUpperCase() : '';

    if (!userRole || !normalizedAllowed.includes(userRole)) {
        const myDashboard = getRoleDashboard(userRole);
        const roleInfo = ROLE_DETAILS[userRole] || { title: userRole || 'Unknown' };

        return (
            <div className="min-h-[80vh] flex items-center justify-center p-6">
                <div className="max-w-md w-full bg-slate-900 border border-rose-500/30 rounded-2xl p-8 shadow-2xl text-center relative overflow-hidden">
                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-rose-500 via-amber-500 to-rose-500"></div>

                    <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 mx-auto flex items-center justify-center mb-5">
                        <ShieldAlert className="w-8 h-8" />
                    </div>

                    <span className="inline-block px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-rose-500/20 text-rose-300 border border-rose-500/30 mb-3">
                        403 • Access Restricted
                    </span>

                    <h2 className="text-xl font-bold text-white mb-2">
                        Unauthorized Module
                    </h2>

                    <p className="text-xs text-slate-400 mb-6 leading-relaxed">
                        Your account role is registered as <strong className="text-teal-400">{roleInfo.title} ({userRole})</strong>.
                        You do not have clinical or administrative clearance to view this module.
                    </p>

                    <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-3.5 mb-6 text-left text-xs">
                        <div className="flex items-center text-slate-300 mb-1">
                            <Lock className="w-3.5 h-3.5 mr-1.5 text-amber-400" />
                            <span className="font-semibold">Required Access Clearance:</span>
                        </div>
                        <p className="text-slate-400 font-mono text-[11px]">
                            {normalizedAllowed.join(', ')}
                        </p>
                    </div>

                    <button
                        onClick={() => navigate(myDashboard)}
                        className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-500 hover:to-cyan-500 text-white font-semibold py-2.5 px-4 rounded-xl text-xs transition shadow-lg shadow-teal-500/20"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        <span>Return to My Dashboard</span>
                    </button>
                </div>
            </div>
        );
    }

    return children;
}
