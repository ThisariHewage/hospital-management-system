import React from 'react';
import { useAuth } from '../context/AuthContext';
import { ROLE_DETAILS } from '../utils/rbacConfig';
import { LogOut, Activity, Shield } from 'lucide-react';

export default function Header() {
    const { user, role, logout } = useAuth();
    const roleDetails = ROLE_DETAILS[role] || { title: role || 'Staff', badge: 'bg-slate-100 text-slate-700' };

    return (
        <header className="h-16 bg-white border-b border-slate-200/80 px-4 sm:px-8 flex items-center justify-between sticky top-0 z-10 shadow-sm">
            <div className="flex items-center space-x-3">
                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 mr-1.5 animate-pulse"></span>
                    MediCore Connected
                </span>
            </div>

            <div className="flex items-center space-x-3 sm:space-x-4">
                <div className="text-right">
                    <p className="text-xs font-semibold text-slate-800">
                        {user?.full_name || user?.username || 'Personnel'}
                    </p>
                    <span className={`inline-block text-[10px] px-2 py-0.2 rounded-full font-semibold border ${roleDetails.badge}`}>
                        {role || 'GUEST'}
                    </span>
                </div>
                <button
                    onClick={logout}
                    className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                    title="Sign Out Session"
                >
                    <LogOut className="w-4 h-4" />
                </button>
            </div>
        </header>
    );
}
