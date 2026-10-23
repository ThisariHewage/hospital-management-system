import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getRoleDashboard } from '../utils/rbacConfig';
import {
    Activity, Stethoscope, HeartPulse, Building2,
    FlaskConical, Pill, Receipt, CheckCircle2,
    ChevronRight, ArrowLeft, AlertCircle, Loader2
} from 'lucide-react';

const ROLES = [
    {
        id: 'DOCTOR',
        title: 'Medical Doctor',
        subtitle: 'Clinical consultation & EMR access',
        icon: Stethoscope,
        gradient: 'from-teal-500/20 to-cyan-600/20',
        border: 'border-teal-500/40',
        iconBg: 'bg-teal-500/20',
        iconColor: 'text-teal-400',
        activeBg: 'bg-teal-500/15',
        activeBorder: 'border-teal-400',
        activeGlow: 'shadow-teal-500/20',
    },
    {
        id: 'NURSE',
        title: 'Head Nurse',
        subtitle: 'Inpatient wards & vitals monitoring',
        icon: HeartPulse,
        gradient: 'from-rose-500/20 to-pink-600/20',
        border: 'border-rose-500/40',
        iconBg: 'bg-rose-500/20',
        iconColor: 'text-rose-400',
        activeBg: 'bg-rose-500/15',
        activeBorder: 'border-rose-400',
        activeGlow: 'shadow-rose-500/20',
    },
    {
        id: 'RECEPTIONIST',
        title: 'Front Desk Receptionist',
        subtitle: 'Patient intake & appointment booking',
        icon: Building2,
        gradient: 'from-amber-500/20 to-orange-600/20',
        border: 'border-amber-500/40',
        iconBg: 'bg-amber-500/20',
        iconColor: 'text-amber-400',
        activeBg: 'bg-amber-500/15',
        activeBorder: 'border-amber-400',
        activeGlow: 'shadow-amber-500/20',
    },
    {
        id: 'LAB_STAFF',
        title: 'Laboratory Technologist',
        subtitle: 'Diagnostic tests & pathology services',
        icon: FlaskConical,
        gradient: 'from-blue-500/20 to-indigo-600/20',
        border: 'border-blue-500/40',
        iconBg: 'bg-blue-500/20',
        iconColor: 'text-blue-400',
        activeBg: 'bg-blue-500/15',
        activeBorder: 'border-blue-400',
        activeGlow: 'shadow-blue-500/20',
    },
    {
        id: 'PHARMACIST',
        title: 'Chief Pharmacist',
        subtitle: 'Drug inventory & dispensary management',
        icon: Pill,
        gradient: 'from-emerald-500/20 to-green-600/20',
        border: 'border-emerald-500/40',
        iconBg: 'bg-emerald-500/20',
        iconColor: 'text-emerald-400',
        activeBg: 'bg-emerald-500/15',
        activeBorder: 'border-emerald-400',
        activeGlow: 'shadow-emerald-500/20',
    },
    {
        id: 'ACCOUNTANT',
        title: 'Finance & Accounts',
        subtitle: 'Invoicing, billing & revenue reports',
        icon: Receipt,
        gradient: 'from-violet-500/20 to-purple-600/20',
        border: 'border-violet-500/40',
        iconBg: 'bg-violet-500/20',
        iconColor: 'text-violet-400',
        activeBg: 'bg-violet-500/15',
        activeBorder: 'border-violet-400',
        activeGlow: 'shadow-violet-500/20',
    },
];

export default function RoleSelection() {
    const navigate = useNavigate();
    const location = useLocation();
    const { login, isAuthenticated, user } = useAuth();

    const [selectedRole, setSelectedRole] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Grab credentials passed from Register page
    const credentials = location.state;

    // Guard: if no credentials, bounce back to register
    useEffect(() => {
        if (!credentials?.username || !credentials?.password) {
            navigate('/register', { replace: true });
        }
    }, [credentials, navigate]);

    // Already authenticated → go to dashboard
    useEffect(() => {
        if (isAuthenticated && user?.role) {
            navigate(getRoleDashboard(user.role), { replace: true });
        }
    }, [isAuthenticated, user, navigate]);

    const handleRegister = async () => {
        if (!selectedRole) { setError('Please select a role to continue.'); return; }
        setError('');
        setLoading(true);

        const result = await login(credentials.username, credentials.password, selectedRole);
        setLoading(false);

        if (result.success) {
            navigate(result.dashboardRoute || getRoleDashboard(result.user.role), { replace: true });
        } else {
            setError(result.message || 'Registration failed. Please try again.');
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-teal-950 flex flex-col justify-center py-10 px-4 sm:px-6 lg:px-8 relative selection:bg-teal-500 selection:text-white">

            {/* Ambient blobs */}
            <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-10 right-10 w-72 h-72 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

            <div className="sm:mx-auto sm:w-full sm:max-w-2xl relative z-10">

                {/* Header */}
                <div className="text-center mb-8">
                    {/* Progress steps */}
                    <div className="flex items-center justify-center gap-3 mb-6">
                        <div className="flex items-center gap-2 opacity-50">
                            <div className="w-8 h-8 rounded-full bg-teal-500 flex items-center justify-center">
                                <CheckCircle2 className="w-4 h-4 text-white" />
                            </div>
                            <span className="text-xs font-semibold text-teal-300 hidden sm:block">Credentials</span>
                        </div>
                        <div className="w-10 h-0.5 bg-teal-500/50" />
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-teal-500 flex items-center justify-center text-white text-xs font-bold shadow-lg shadow-teal-500/30">2</div>
                            <span className="text-xs font-semibold text-teal-300 hidden sm:block">Select Role</span>
                        </div>
                    </div>

                    <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-teal-500 to-blue-600 p-0.5 shadow-xl shadow-teal-500/20 mb-4">
                        <div className="w-full h-full bg-slate-950/90 rounded-[14px] flex items-center justify-center">
                            <Activity className="w-6 h-6 text-teal-400 animate-pulse" />
                        </div>
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">Select Your Role</h1>
                    {credentials?.username && (
                        <p className="mt-1.5 text-sm text-slate-400">
                            Registering as{' '}
                            <span className="text-teal-300 font-semibold">@{credentials.username}</span>
                        </p>
                    )}
                </div>

                {/* Card */}
                <div className="bg-slate-900/90 backdrop-blur-xl border border-slate-800/90 py-8 px-6 shadow-2xl rounded-2xl sm:px-10">

                    {/* Error */}
                    {error && (
                        <div className="bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs p-3.5 rounded-xl flex items-start gap-2.5 mb-5">
                            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                            <span>{error}</span>
                        </div>
                    )}

                    <p className="text-xs text-slate-500 mb-4 font-medium uppercase tracking-widest">
                        Choose your hospital department role
                    </p>

                    {/* Role Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
                        {ROLES.map((role) => {
                            const Icon = role.icon;
                            const isSelected = selectedRole === role.id;
                            return (
                                <button
                                    key={role.id}
                                    id={`role-${role.id.toLowerCase()}`}
                                    type="button"
                                    onClick={() => { setSelectedRole(role.id); setError(''); }}
                                    className={`relative p-4 rounded-xl border text-left transition-all duration-200 cursor-pointer group ${isSelected
                                            ? `${role.activeBg} ${role.activeBorder} shadow-lg ${role.activeGlow} -translate-y-0.5`
                                            : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 hover:-translate-y-0.5 hover:bg-slate-900/80'
                                        }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 transition-colors duration-200 ${isSelected ? role.iconBg : 'bg-slate-900'
                                            }`}>
                                            <Icon className={`w-5 h-5 transition-colors duration-200 ${isSelected ? role.iconColor : 'text-slate-500 group-hover:text-slate-300'
                                                }`} />
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <p className={`text-sm font-bold truncate transition-colors duration-200 ${isSelected ? 'text-white' : 'text-slate-300 group-hover:text-white'
                                                }`}>
                                                {role.title}
                                            </p>
                                            <p className="text-[11px] text-slate-500 mt-0.5 leading-tight line-clamp-1">
                                                {role.subtitle}
                                            </p>
                                        </div>
                                        {isSelected && (
                                            <CheckCircle2 className={`w-5 h-5 shrink-0 ${role.iconColor}`} />
                                        )}
                                    </div>
                                    {/* Role ID badge */}
                                    <span className={`mt-2 inline-block text-[10px] font-mono px-1.5 py-0.5 rounded tracking-wide ${isSelected ? `${role.iconColor} bg-white/5` : 'text-slate-600'
                                        }`}>
                                        {role.id}
                                    </span>
                                </button>
                            );
                        })}
                    </div>

                    {/* Action buttons */}
                    <div className="flex flex-col sm:flex-row gap-3">
                        <button
                            type="button"
                            onClick={() => navigate('/register')}
                            className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-slate-700 text-slate-400 hover:text-white hover:border-slate-600 text-sm font-semibold transition-all duration-200 cursor-pointer sm:w-auto"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Back
                        </button>

                        <button
                            id="confirm-register-btn"
                            type="button"
                            disabled={!selectedRole || loading}
                            onClick={handleRegister}
                            className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-teal-600 via-teal-500 to-cyan-500 hover:from-teal-500 hover:to-cyan-400 text-white font-semibold py-3 px-4 rounded-xl shadow-lg shadow-teal-500/20 transition-all text-sm disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer active:scale-[0.99]"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    <span>Registering Account…</span>
                                </>
                            ) : (
                                <>
                                    <span>Confirm & Register</span>
                                    <ChevronRight className="w-4 h-4" />
                                </>
                            )}
                        </button>
                    </div>

                    {/* Sign In link */}
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
