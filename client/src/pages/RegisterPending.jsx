import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Activity, CheckCircle2, Clock, ArrowRight } from 'lucide-react';

export default function RegisterPending() {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-teal-950 flex flex-col items-center justify-center py-10 px-4 sm:px-6 lg:px-8 relative selection:bg-teal-500 selection:text-white">

            {/* Ambient blobs */}
            <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-10 right-10 w-72 h-72 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

            <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">

                {/* Logo */}
                <div className="flex justify-center mb-8">
                    <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-teal-500 to-blue-600 p-0.5 shadow-xl shadow-teal-500/20">
                        <div className="w-full h-full bg-slate-950/90 rounded-[14px] flex items-center justify-center">
                            <Activity className="w-6 h-6 text-teal-400" />
                        </div>
                    </div>
                </div>

                {/* Card */}
                <div className="bg-slate-900/90 backdrop-blur-xl border border-slate-800/90 py-10 px-8 shadow-2xl rounded-2xl text-center">

                    {/* Success Icon */}
                    <div className="flex justify-center mb-5">
                        <div className="w-20 h-20 rounded-full bg-teal-500/15 border-2 border-teal-500/40 flex items-center justify-center shadow-lg shadow-teal-500/10">
                            <CheckCircle2 className="w-10 h-10 text-teal-400" />
                        </div>
                    </div>

                    <h1 className="text-2xl font-extrabold text-white tracking-tight mb-2">
                        Registration Submitted!
                    </h1>
                    <p className="text-sm text-slate-400 mb-6 leading-relaxed">
                        Your account has been successfully created and is now
                        <span className="text-amber-400 font-semibold"> pending administrator approval</span>.
                    </p>

                    {/* Status Banner */}
                    <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 flex items-start gap-3 text-left mb-6">
                        <Clock className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                        <div>
                            <p className="text-sm font-semibold text-amber-300 mb-0.5">Awaiting Admin Review</p>
                            <p className="text-xs text-slate-400 leading-relaxed">
                                The hospital administrator will review your registration and activate your access.
                                You will be able to sign in once your account is approved.
                            </p>
                        </div>
                    </div>

                    {/* What Happens Next */}
                    <div className="text-left mb-8 space-y-3">
                        <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-500 mb-2">What happens next</p>
                        {[
                            'Administrator reviews your registration request.',
                            'Your account is activated with your chosen role.',
                            'You can sign in and access the hospital system.',
                        ].map((step, i) => (
                            <div key={i} className="flex items-start gap-3">
                                <div className="w-5 h-5 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center shrink-0 mt-0.5">
                                    <span className="text-[10px] font-bold text-teal-400">{i + 1}</span>
                                </div>
                                <p className="text-xs text-slate-400 leading-relaxed">{step}</p>
                            </div>
                        ))}
                    </div>

                    {/* CTA */}
                    <button
                        id="go-to-signin-btn"
                        type="button"
                        onClick={() => navigate('/login')}
                        className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-teal-600 via-teal-500 to-cyan-500 hover:from-teal-500 hover:to-cyan-400 text-white font-semibold py-3 px-4 rounded-xl shadow-lg shadow-teal-500/20 transition-all text-sm cursor-pointer active:scale-[0.99]"
                    >
                        <span>Go to Sign In</span>
                        <ArrowRight className="w-4 h-4" />
                    </button>

                    <p className="mt-4 text-xs text-slate-600">
                        Contact hospital IT support if your approval is delayed.
                    </p>
                </div>
            </div>
        </div>
    );
}
