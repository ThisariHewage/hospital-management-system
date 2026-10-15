import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getRoleDashboard } from '../utils/rbacConfig';
import {
    Activity, Shield, Eye, EyeOff, Lock, User,
    AlertCircle, CheckCircle2, ArrowRight,
    Stethoscope, HeartPulse, Building2, TestTube2,
    Pill, Receipt, ShieldCheck
} from 'lucide-react';

// ADMIN is intentionally excluded — admin logs in with username+password only (no role selection required)
const ROLE_OPTIONS = [
    { id: 'DOCTOR', title: 'Medical Doctor', icon: Stethoscope, badge: 'teal', description: 'Clinical consultation & EMR' },
    { id: 'NURSE', title: 'Head Nurse', icon: HeartPulse, badge: 'rose', description: 'Inpatient wards & vitals' },
    { id: 'RECEPTIONIST', title: 'Front Desk Receptionist', icon: Building2, badge: 'amber', description: 'Patient intake & bookings' },
    { id: 'LAB_STAFF', title: 'Laboratory Technologist', icon: TestTube2, badge: 'blue', description: 'Diagnostic tests & pathology' },
    { id: 'PHARMACIST', title: 'Chief Pharmacist', icon: Pill, badge: 'emerald', description: 'Drug inventory & dispensary' },
    { id: 'ACCOUNTANT', title: 'Finance & Accounts', icon: Receipt, badge: 'indigo', description: 'Invoicing & revenue reports' }
];

export default function Login() {
    const { login, isAuthenticated, user } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [selectedRole, setSelectedRole] = useState(null);
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [successMsg, setSuccessMsg] = useState('');
    const [loading, setLoading] = useState(false);

    // If already authenticated, redirect straight to role dashboard
    useEffect(() => {
        if (isAuthenticated && user?.role) {
            const redirectUrl = location.state?.from?.pathname || getRoleDashboard(user.role);
            navigate(redirectUrl, { replace: true });
        }
    }, [isAuthenticated, user, navigate, location]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccessMsg('');

        if (!username.trim()) {
            setError('Please enter a username.');
            return;
        }

        if (!password) {
            setError('Please enter a password.');
            return;
        }


        setLoading(true);

        const result = await login(username.trim(), password, selectedRole);
        setLoading(false);

        if (result.success) {
            const destination = result.dashboardRoute || getRoleDashboard(result.user.role);
            navigate(destination, { replace: true });
        } else {
            setError(result.message || 'Authentication failed. Please verify credentials.');
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-teal-950 flex flex-col justify-center py-10 px-4 sm:px-6 lg:px-8 relative selection:bg-teal-500 selection:text-white">
            {/* Ambient lighting effects */}
            <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none"></div>
            <div className="absolute bottom-10 right-10 w-72 h-72 bg-blue-600/10 rounded-full blur-3xl pointer-events-none"></div>

            <div className="sm:mx-auto sm:w-full sm:max-w-xl relative z-10">
                {/* Hospital Branding Header */}
                <div className="text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-teal-500 to-blue-600 p-0.5 shadow-xl shadow-teal-500/20 mb-4 transform hover:scale-105 transition-transform duration-300">
                        <div className="w-full h-full bg-slate-950/90 rounded-[14px] flex items-center justify-center">
                            <Activity className="w-8 h-8 text-teal-400 animate-pulse" />
                        </div>
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                        MediCore General Hospital
                    </h1>
                    <p className="mt-1.5 text-xs sm:text-sm text-slate-400 flex items-center justify-center space-x-1.5">
                        <Shield className="w-3.5 h-3.5 text-teal-400" />
                        <span>Role-Based Authentication & Verification Portal</span>
                    </p>
                </div>

                {/* Login Card */}
                <div className="mt-8 bg-slate-900/90 backdrop-blur-xl border border-slate-800/90 py-8 px-6 shadow-2xl rounded-2xl sm:px-10">
                    <form className="space-y-5" onSubmit={handleSubmit} noValidate>
                        {/* Error Alert */}
                        {error && (
                            <div className="bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs p-3.5 rounded-xl flex items-start space-x-2.5 animate-fadeIn">
                                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                                <div className="leading-relaxed">
                                    <span className="font-semibold">Authentication Error: </span>
                                    {error}
                                </div>
                            </div>
                        )}

                        {/* Success Alert */}
                        {successMsg && (
                            <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs p-3.5 rounded-xl flex items-start space-x-2.5 animate-fadeIn">
                                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                                <div className="leading-relaxed font-medium">
                                    {successMsg}
                                </div>
                            </div>
                        )}

                        {/* Username Input */}
                        <div>
                            <label
                                htmlFor="username"
                                className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5"
                            >
                                Username
                            </label>
                            <div className="relative rounded-xl shadow-sm">
                                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                                    <User className="w-4 h-4" />
                                </div>
                                <input
                                    id="username"
                                    name="username"
                                    type="text"
                                    autoComplete="username"
                                    required
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    className="w-full bg-slate-950/70 border border-slate-700/80 rounded-xl pl-10 pr-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500/80 focus:border-teal-500 transition"
                                    placeholder="Enter your username"
                                />
                            </div>
                        </div>

                        {/* Password Input with Show/Hide Toggle */}
                        <div>
                            <label
                                htmlFor="password"
                                className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5"
                            >
                                Password
                            </label>
                            <div className="relative rounded-xl shadow-sm">
                                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                                    <Lock className="w-4 h-4" />
                                </div>
                                <input
                                    id="password"
                                    name="password"
                                    type={showPassword ? 'text' : 'password'}
                                    autoComplete="current-password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full bg-slate-950/70 border border-slate-700/80 rounded-xl pl-10 pr-10 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500/80 focus:border-teal-500 transition"
                                    placeholder="Enter your password"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-200 transition focus:outline-none"
                                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                                >
                                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                        </div>

                        {/* Role Selection Field — Staff only (Admin logs in without selecting a role) */}
                        <div>
                            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
                                Select Hospital Role
                                <span className="ml-2 text-[10px] font-normal text-slate-500 normal-case tracking-normal">(Staff only — leave unselected if you are the administrator)</span>
                            </label>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                {ROLE_OPTIONS.map((item) => {
                                    const Icon = item.icon;
                                    const isSelected = selectedRole === item.id;
                                    return (
                                        <button
                                            key={item.id}
                                            type="button"
                                            onClick={() => setSelectedRole(isSelected ? null : item.id)}
                                            className={`p-2.5 rounded-xl border text-left transition flex items-center space-x-3 cursor-pointer ${isSelected
                                                ? 'bg-teal-500/20 border-teal-500 text-white shadow-md shadow-teal-500/10'
                                                : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                                                }`}
                                        >
                                            <div
                                                className={`p-2 rounded-lg shrink-0 ${isSelected ? 'bg-teal-500 text-white' : 'bg-slate-900 text-slate-400'
                                                    }`}
                                            >
                                                <Icon className="w-4 h-4" />
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-xs font-bold truncate leading-tight">
                                                    {item.title}
                                                </p>
                                                <p className="text-[10px] text-slate-400 truncate mt-0.5 font-mono">
                                                    {item.id}
                                                </p>
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Sign In / Register Button */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-teal-600 via-teal-500 to-cyan-600 hover:from-teal-500 hover:to-cyan-500 text-white font-semibold py-3 px-4 rounded-xl shadow-lg shadow-teal-500/20 transition-all text-sm disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer active:scale-[0.99] mt-2"
                        >
                            {loading ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                                    <span>Verifying Credentials & Database Role...</span>
                                </>
                            ) : (
                                <>
                                    <Lock className="w-4 h-4" />
                                    <span>Sign In </span>
                                    <ArrowRight className="w-4 h-4" />
                                </>
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
