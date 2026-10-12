import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck, UserCheck, Stethoscope, HeartPulse, Building2, TestTube2, Pill, Receipt } from 'lucide-react';

const DEMO_PERSONAS = [
    { role: 'ADMIN', name: 'System Admin', username: 'admin', icon: ShieldCheck, color: 'from-purple-600 to-indigo-600', badge: 'Full Access' },
    { role: 'DOCTOR', name: 'Dr. Robert Smith', username: 'dr_smith', icon: Stethoscope, color: 'from-teal-600 to-cyan-600', badge: 'Cardiologist' },
    { role: 'NURSE', name: 'Nurse Joy Carter', username: 'nurse_joy', icon: HeartPulse, color: 'from-rose-500 to-pink-600', badge: 'Head Nurse' },
    { role: 'RECEPTIONIST', name: 'Alex Rivera', username: 'reception_alex', icon: Building2, color: 'from-amber-500 to-orange-600', badge: 'Front Desk' },
    { role: 'LAB_STAFF', name: 'David Chen', username: 'lab_david', icon: TestTube2, color: 'from-blue-600 to-cyan-600', badge: 'Senior Lab Tech' },
    { role: 'PHARMACIST', name: 'Emma Watson', username: 'pharma_emma', icon: Pill, color: 'from-emerald-600 to-teal-600', badge: 'Chief Pharmacist' },
    { role: 'ACCOUNTANT', name: 'Marcus Brody', username: 'account_marcus', icon: Receipt, color: 'from-indigo-600 to-blue-600', badge: 'Finance Controller' },
];

export default function Login() {
    const { login, switchDemoRole } = useAuth();
    const navigate = useNavigate();
    const [username, setUsername] = useState('admin');
    const [password, setPassword] = useState('password123');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        const res = await login(username, password);
        setLoading(false);

        if (res.success) {
            navigate('/');
        } else {
            setError(res.message);
        }
    };

    const handleQuickPersona = async (persona) => {
        setUsername(persona.username);
        setPassword('password123');
        await switchDemoRole(persona.role);
        navigate('/');
    };

    return (
        <div className="min-h-screen bg-slate-950 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-teal-500 to-cyan-400 mx-auto flex items-center justify-center text-3xl shadow-xl shadow-teal-500/20 mb-4">
                    🏥
                </div>
                <h2 className="text-3xl font-extrabold text-white tracking-tight">MediCore HMS</h2>
                <p className="mt-2 text-sm text-slate-400">Hospital Management System • Secure Portal</p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-slate-900 border border-slate-800 py-8 px-6 shadow-2xl rounded-2xl sm:px-10">
                    <form className="space-y-5" onSubmit={handleSubmit}>
                        {error && (
                            <div className="bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs p-3 rounded-lg flex items-center">
                                <span>⚠️ {error}</span>
                            </div>
                        )}

                        <div>
                            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                                Username or Email
                            </label>
                            <input
                                type="text"
                                required
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="w-full bg-slate-800/80 border border-slate-700 rounded-lg px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500"
                                placeholder="Enter username"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                                Password
                            </label>
                            <input
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full bg-slate-800/80 border border-slate-700 rounded-lg px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500"
                                placeholder="••••••••"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-500 hover:to-cyan-500 text-white font-semibold py-2.5 px-4 rounded-lg shadow-lg shadow-teal-500/20 transition-all text-sm disabled:opacity-50"
                        >
                            {loading ? 'Authenticating...' : 'Sign In with Credentials'}
                        </button>
                    </form>

                    {/* Quick Demo Personas */}
                    <div className="mt-8 pt-6 border-t border-slate-800">
                        <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 text-center">
                            ⚡ Quick 1-Click Persona Sign-In (Demo)
                        </p>
                        <div className="grid grid-cols-1 gap-2">
                            {DEMO_PERSONAS.map((p) => {
                                const Icon = p.icon;
                                return (
                                    <button
                                        key={p.role}
                                        type="button"
                                        onClick={() => handleQuickPersona(p)}
                                        className="flex items-center justify-between p-2.5 rounded-lg bg-slate-800/50 hover:bg-slate-800 border border-slate-700/60 hover:border-teal-500/40 transition group text-left"
                                    >
                                        <div className="flex items-center space-x-3">
                                            <div className={`w-7 h-7 rounded-md bg-gradient-to-br ${p.color} flex items-center justify-center text-white shrink-0 shadow-sm`}>
                                                <Icon className="w-4 h-4" />
                                            </div>
                                            <div>
                                                <p className="text-xs font-semibold text-slate-200 group-hover:text-teal-300 transition">{p.name}</p>
                                                <p className="text-[10px] text-slate-400 font-mono">@{p.username}</p>
                                            </div>
                                        </div>
                                        <span className="text-[10px] bg-slate-700/60 text-slate-300 px-2 py-0.5 rounded font-medium">
                                            {p.badge}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
