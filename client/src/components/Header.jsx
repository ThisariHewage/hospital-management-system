import React from 'react';
import { useAuth } from '../context/AuthContext';
import { LogOut, Bell, Shield } from 'lucide-react';

export default function Header() {
    const { user, logout } = useAuth();

    return (
        <header className="h-16 bg-white border-b border-slate-200/80 px-8 flex items-center justify-between sticky top-0 z-10 shadow-sm">
            <div className="flex items-center space-x-3">
                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 mr-1.5 animate-pulse"></span>
                    Hospital System Online
                </span>
                <span className="text-xs text-slate-500">
                    Database: <code className="bg-slate-100 px-1 py-0.5 rounded text-teal-700 font-mono">hospital_db</code>
                </span>
            </div>

            <div className="flex items-center space-x-4">
                <div className="text-right">
                    <p className="text-xs font-semibold text-slate-700">{user?.username || 'User'}</p>
                    <p className="text-[11px] text-teal-600 font-medium">{user?.role || 'Guest'}</p>
                </div>
                <button
                    onClick={logout}
                    className="p-2 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                    title="Logout"
                >
                    <LogOut className="w-4 h-4" />
                </button>
            </div>
        </header>
    );
}
