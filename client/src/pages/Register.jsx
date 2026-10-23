import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getRoleDashboard } from '../utils/rbacConfig';
import {
    Activity, User, Lock, Eye, EyeOff, ArrowRight,
    Shield, CheckCircle2, AlertCircle, UserPlus
} from 'lucide-react';

export default function Register() {
    const navigate = useNavigate();
    const { isAuthenticated, user } = useAuth();

    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [error, setError] = useState('');

    // Already authenticated → go to dashboard
    useEffect(() => {
        if (isAuthenticated && user?.role) {
            navigate(getRoleDashboard(user.role), { replace: true });
        }
    }, [isAuthenticated, user, navigate]);

    const validate = () => {
        if (!username.trim()) return 'Please enter a username.';
        if (username.trim().length < 3) return 'Username must be at least 3 characters.';
        if (!password) return 'Please enter a password.';
        if (password.length < 6) return 'Password must be at least 6 characters.';
        if (password !== confirmPassword) return 'Passwords do not match.';
        return null;
    };

    const handleNext = (e) => {
        e.preventDefault();
        const err = validate();
        if (err) { setError(err); return; }
        // Pass credentials forward via router state (never stored persistently)
        navigate('/register/role', {
            state: { username: username.trim(), password }
        });
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-teal-950 flex flex-col justify-center py-10 px-4 sm:px-6 lg:px-8 relative selection:bg-teal-500 selection:text-white">

            {/* Ambient blobs */}
            <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-10 right-10 w-72 h-72 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

            <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">

                {/* Header */}
                <div className="text-center mb-8">
                    {/* Progress steps */}
                    <div className="flex items-center justify-center gap-3 mb-6">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-teal-500 flex items-center justify-center text-white text-xs font-bold shadow-lg shadow-teal-500/30">1</div>
                            <span className="text-xs font-semibold text-teal-300 hidden sm:block">Credentials</span>
                        </div>
                        <div className="w-10 h-0.5 bg-slate-700" />
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-500 text-xs font-bold">2</div>
                            <span className="text-xs font-semibold text-slate-500 hidden sm:block">Select Role</span>
                        </div>
                    </div>

                    <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-teal-500 to-blue-600 p-0.5 shadow-xl shadow-teal-500/20 mb-4">
                        <div className="w-full h-full bg-slate-950/90 rounded-[14px] flex items-center justify-center">
                            <UserPlus className="w-6 h-6 text-teal-400" />
                        </div>
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">Create Account</h1>
                    <p className="mt-1.5 text-sm text-slate-400 flex items-center justify-center gap-1.5">
                        <Activity className="w-3.5 h-3.5 text-teal-400" />
                        MediCore General Hospital — Staff Registration
                    </p>
                </div>

                {/* Card */}
                <div className="bg-slate-900/90 backdrop-blur-xl border border-slate-800/90 py-8 px-6 shadow-2xl rounded-2xl sm:px-10">
                    <form onSubmit={handleNext} noValidate className="space-y-5">

                        {/* Error */}
                        {error && (
                            <div className="bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs p-3.5 rounded-xl flex items-start gap-2.5">
                                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                                <span>{error}</span>
                            </div>
                        )}

                        {/* Username */}
                        <div>
                            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                                Username
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                                    <User className="w-4 h-4" />
                                </div>
                                <input
                                    id="reg-username"
                                    type="text"
                                    autoComplete="username"
                                    required
                                    value={username}
                                    onChange={(e) => { setUsername(e.target.value); setError(''); }}
                                    className="w-full bg-slate-950/70 border border-slate-700/80 rounded-xl pl-10 pr-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500/80 focus:border-teal-500 transition"
                                    placeholder="Choose a username"
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <div>
                            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                                Password
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                                    <Lock className="w-4 h-4" />
                                </div>
                                <input
                                    id="reg-password"
                                    type={showPassword ? 'text' : 'password'}
                                    autoComplete="new-password"
                                    required
                                    value={password}
                                    onChange={(e) => { setPassword(e.target.value); setError(''); }}
                                    className="w-full bg-slate-950/70 border border-slate-700/80 rounded-xl pl-10 pr-10 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500/80 focus:border-teal-500 transition"
                                    placeholder="Create a password (min 6 chars)"
                                />
                                <button type="button" onClick={() => setShowPassword(!showPassword)}
                                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-200 transition focus:outline-none">
                                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                        </div>

                        {/* Confirm Password */}
                        <div>
                            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                                Confirm Password
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                                    <Shield className="w-4 h-4" />
                                </div>
                                <input
                                    id="reg-confirm"
                                    type={showConfirm ? 'text' : 'password'}
                                    autoComplete="new-password"
                                    required
                                    value={confirmPassword}
                                    onChange={(e) => { setConfirmPassword(e.target.value); setError(''); }}
                                    className={`w-full bg-slate-950/70 border rounded-xl pl-10 pr-10 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 transition ${confirmPassword && password !== confirmPassword
                                            ? 'border-rose-500/60 focus:ring-rose-500/50'
                                            : confirmPassword && password === confirmPassword
                                                ? 'border-emerald-500/60 focus:ring-emerald-500/50'
                                                : 'border-slate-700/80 focus:ring-teal-500/80 focus:border-teal-500'
                                        }`}
                                    placeholder="Re-enter your password"
                                />
                                <button type="button" onClick={() => setShowConfirm(!showConfirm)}
                                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-200 transition focus:outline-none">
                                    {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                                {/* Match indicator */}
                                {confirmPassword && password === confirmPassword && (
                                    <CheckCircle2 className="absolute right-8 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-400 pointer-events-none" />
                                )}
                            </div>
                        </div>

                        {/* Next button */}
                        <button
                            id="next-btn"
                            type="submit"
                            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-teal-600 via-teal-500 to-cyan-600 hover:from-teal-500 hover:to-cyan-500 text-white font-semibold py-3 px-4 rounded-xl shadow-lg shadow-teal-500/20 transition-all text-sm cursor-pointer active:scale-[0.99] mt-2"
                        >
                            <span>Next — Select Your Role</span>
                            <ArrowRight className="w-4 h-4" />
                        </button>
                    </form>

                    {/* Already have account */}
                    <p className="mt-5 text-center text-xs text-slate-500">
                        Already have an account?{' '}
                        <button
                            onClick={() => navigate('/login')}
                            className="text-teal-400 hover:text-teal-300 font-semibold transition cursor-pointer"
                        >
                            Sign In
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
}
