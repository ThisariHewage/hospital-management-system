import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Activity, Heart, Shield, Users, Clock, Award,
    ChevronRight, Phone, MapPin, Mail, Star,
    Stethoscope, HeartPulse, FlaskConical, Pill
} from 'lucide-react';

const STATS = [
    { value: '15,000+', label: 'Patients Served', icon: Users },
    { value: '200+', label: 'Expert Doctors', icon: Stethoscope },
    { value: '24 / 7', label: 'Emergency Care', icon: Clock },
    { value: '98%', label: 'Patient Satisfaction', icon: Star },
];

const SERVICES = [
    { icon: HeartPulse, title: 'Cardiology', desc: 'Advanced cardiac diagnostics & interventional procedures.' },
    { icon: FlaskConical, title: 'Laboratory', desc: 'State-of-the-art diagnostic testing & pathology services.' },
    { icon: Pill, title: 'Pharmacy', desc: 'In-house dispensary with 24 / 7 medication availability.' },
    { icon: Stethoscope, title: 'General Medicine', desc: 'Comprehensive outpatient & inpatient medical care.' },
];

export default function LandingPage() {
    const navigate = useNavigate();
    const [scrolled, setScrolled] = useState(false);
    const [heroLoaded, setHeroLoaded] = useState(false);

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    return (
        <div className="min-h-screen bg-slate-950 text-white selection:bg-teal-500 selection:text-white font-sans">

            {/* ── NAVBAR ─────────────────────────────────────────────── */}
            <nav className={`fixed top-0 inset-x-0 z-50 transition-all duration-500 ${scrolled
                ? 'bg-slate-950/95 backdrop-blur-xl border-b border-slate-800/80 shadow-2xl shadow-black/40'
                : 'bg-transparent'
                }`}>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-18 flex items-center justify-between">

                    {/* Logo */}
                    <div className="flex items-center gap-3 group cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
                        <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-teal-400 to-cyan-600 shadow-lg shadow-teal-500/30 group-hover:shadow-teal-400/50 transition-shadow duration-300">
                            <Activity className="w-5 h-5 text-white" />
                            <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-slate-950 animate-pulse" />
                        </div>
                        <div className="leading-tight">
                            <p className="text-sm font-extrabold tracking-tight text-white">MediCore</p>
                            <p className="text-[10px] font-medium text-teal-400 uppercase tracking-widest">General Hospital</p>
                        </div>
                    </div>

                    {/* Desktop Centre Links */}
                    <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-300">
                        {['Home', 'Services', 'About', 'Contact'].map(link => (
                            <a
                                key={link}
                                href={`#${link.toLowerCase()}`}
                                className="relative py-1 hover:text-white transition-colors duration-200 after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-0 hover:after:w-full after:bg-teal-400 after:transition-all after:duration-300"
                            >
                                {link}
                            </a>
                        ))}
                    </div>

                    {/* Auth Buttons — TOP RIGHT */}
                    <div className="flex items-center gap-2 sm:gap-3">
                        <button
                            id="register-btn"
                            onClick={() => navigate('/register')}
                            className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold rounded-xl border border-teal-500/50 text-teal-300 hover:bg-teal-500/10 hover:border-teal-400 hover:text-teal-200 transition-all duration-200 cursor-pointer"
                        >
                            Register
                        </button>
                        <button
                            id="signin-btn"
                            onClick={() => navigate('/login')}
                            className="inline-flex items-center gap-1.5 px-4 sm:px-5 py-2 text-sm font-semibold rounded-xl bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-400 hover:to-cyan-500 text-white shadow-lg shadow-teal-500/25 hover:shadow-teal-400/40 transition-all duration-200 active:scale-95 cursor-pointer"
                        >
                            Sign In
                            <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                    </div>
                </div>
            </nav>

            {/* ── HERO SECTION ───────────────────────────────────────── */}
            <section id="home" className="relative min-h-screen flex flex-col justify-end overflow-hidden">

                {/* Background hero image */}
                <div className="absolute inset-0">
                    <img
                        src="/hospital_hero.png"
                        alt="MediCore General Hospital"
                        className={`w-full h-full object-cover transition-opacity duration-1000 ${heroLoaded ? 'opacity-100' : 'opacity-0'}`}
                        onLoad={() => setHeroLoaded(true)}
                    />
                    {/* Layered gradient overlays */}
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/70 to-slate-900/40" />
                    <div className="absolute inset-0 bg-gradient-to-r from-slate-950/60 via-transparent to-transparent" />
                    {/* Subtle colour tint */}
                    <div className="absolute inset-0 bg-teal-900/10" />
                </div>

                {/* Floating ambient blobs */}
                <div className="absolute top-1/3 right-1/4 w-80 h-80 bg-teal-500/10 rounded-full blur-[80px] pointer-events-none animate-pulse" />
                <div className="absolute bottom-1/3 left-1/4 w-64 h-64 bg-cyan-500/8 rounded-full blur-[60px] pointer-events-none" />

                {/* Hero Content */}
                <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20 sm:pb-28 pt-32">
                    <div className="max-w-2xl">

                        {/* Badge */}
                        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-teal-500/15 border border-teal-500/30 text-teal-300 text-xs font-semibold mb-6 backdrop-blur-sm">
                            <span className="w-1.5 h-1.5 bg-teal-400 rounded-full animate-pulse" />
                            Accredited Centre of Excellence
                        </div>

                        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight tracking-tight text-white drop-shadow-lg">
                            Compassionate Care,{' '}
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-cyan-400">
                                Advanced Medicine
                            </span>
                        </h1>

                        <p className="mt-5 text-base sm:text-lg text-slate-300 leading-relaxed max-w-xl">
                            MediCore General Hospital delivers world-class healthcare with cutting-edge technology
                            and a patient-first philosophy — available 24 hours a day, 7 days a week.
                        </p>



                        {/* Trust badges */}
                        <div className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-slate-400">
                            {['ISO 9001 Certified', 'JCI Accredited', 'HIPAA Compliant'].map(badge => (
                                <span key={badge} className="flex items-center gap-1.5">
                                    <Award className="w-3 h-3 text-teal-400" />
                                    {badge}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Scroll indicator */}
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 animate-bounce hidden sm:flex flex-col items-center gap-1.5 text-slate-500 text-[10px] font-medium tracking-widest uppercase">
                    <span>Scroll</span>
                    <div className="w-0.5 h-8 bg-gradient-to-b from-slate-500 to-transparent" />
                </div>
            </section>

            {/* ── STATS STRIP ────────────────────────────────────────── */}
            <section className="relative z-10 bg-gradient-to-r from-teal-600/90 via-teal-500/90 to-cyan-600/90 backdrop-blur-sm border-y border-teal-400/20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
                    {STATS.map(({ value, label, icon: Icon }) => (
                        <div key={label} className="flex flex-col items-center gap-2 group">
                            <div className="w-11 h-11 rounded-xl bg-white/15 flex items-center justify-center group-hover:bg-white/25 transition-colors duration-200">
                                <Icon className="w-5 h-5 text-white" />
                            </div>
                            <p className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">{value}</p>
                            <p className="text-xs font-semibold uppercase tracking-widest text-teal-100/80">{label}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* ── SERVICES ───────────────────────────────────────────── */}
            <section id="services" className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
                <div className="text-center mb-14">
                    <span className="inline-block px-3.5 py-1 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-300 text-xs font-semibold uppercase tracking-widest mb-4">Our Services</span>
                    <h2 className="text-3xl sm:text-4xl font-extrabold text-white">Comprehensive Healthcare</h2>
                    <p className="mt-3 text-slate-400 max-w-lg mx-auto text-sm leading-relaxed">
                        From emergency response to specialist consultations, we cover every aspect of your health journey.
                    </p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {SERVICES.map(({ icon: Icon, title, desc }) => (
                        <div
                            key={title}
                            className="group relative p-6 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-teal-500/50 hover:bg-slate-900/90 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-teal-500/10 cursor-default"
                        >
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-teal-500/20 to-cyan-600/20 border border-teal-500/20 flex items-center justify-center mb-4 group-hover:from-teal-500/30 group-hover:to-cyan-600/30 transition-all duration-300">
                                <Icon className="w-6 h-6 text-teal-400" />
                            </div>
                            <h3 className="text-base font-bold text-white mb-2">{title}</h3>
                            <p className="text-sm text-slate-400 leading-relaxed">{desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* ── ABOUT ──────────────────────────────────────────────── */}
            <section id="about" className="py-20 px-4 sm:px-6 lg:px-8 bg-slate-900/40 border-y border-slate-800/50">
                <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-14">
                    <div className="flex-1 space-y-5">
                        <span className="inline-block px-3.5 py-1 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-300 text-xs font-semibold uppercase tracking-widest">About Us</span>
                        <h2 className="text-3xl sm:text-4xl font-extrabold text-white leading-tight">A Legacy of Healing &amp; Innovation</h2>
                        <p className="text-slate-400 text-sm leading-relaxed">
                            Founded over three decades ago, MediCore General Hospital has grown into a premier tertiary care institution.
                            Our multidisciplinary teams leverage cutting-edge medical technology alongside compassionate, patient-focused principles.
                        </p>
                        <ul className="space-y-2.5 text-sm text-slate-300">
                            {[
                                'Internationally trained specialist physicians',
                                'Modern ICU, CCU, and NICU facilities',
                                'Digital health records &amp; telemedicine support',
                            ].map(item => (
                                <li key={item} className="flex items-start gap-2.5">
                                    <Heart className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
                                    <span dangerouslySetInnerHTML={{ __html: item }} />
                                </li>
                            ))}
                        </ul>
                        <button
                            onClick={() => navigate('/login')}
                            className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold rounded-xl bg-teal-500/15 border border-teal-500/40 text-teal-300 hover:bg-teal-500/25 hover:text-white transition-all duration-200 cursor-pointer mt-2"
                        >
                            Access Staff Portal <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>

                    {/* Decorative card grid */}
                    <div className="flex-1 grid grid-cols-2 gap-4 w-full max-w-sm lg:max-w-none">
                        {[
                            { label: 'Beds Available', val: '450', color: 'teal' },
                            { label: 'Years of Service', val: '30+', color: 'cyan' },
                            { label: 'Departments', val: '28', color: 'emerald' },
                            { label: 'Staff Members', val: '1200+', color: 'blue' },
                        ].map(({ label, val, color }) => (
                            <div key={label} className={`p-5 rounded-2xl bg-${color}-500/10 border border-${color}-500/20 flex flex-col gap-1 hover:bg-${color}-500/15 transition-colors duration-200`}>
                                <p className={`text-2xl font-extrabold text-${color}-400`}>{val}</p>
                                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{label}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── CONTACT ────────────────────────────────────────────── */}
            <section id="contact" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
                <div className="text-center mb-12">
                    <span className="inline-block px-3.5 py-1 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-300 text-xs font-semibold uppercase tracking-widest mb-4">Contact Us</span>
                    <h2 className="text-3xl sm:text-4xl font-extrabold text-white">We're Here for You</h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-3xl mx-auto">
                    {[
                        { icon: Phone, label: 'Emergency Hotline', value: '+1 (800) MEDI-CORE' },
                        { icon: MapPin, label: 'Location', value: '128 Health Ave, Medical City' },
                        { icon: Mail, label: 'Email', value: 'care@medicore.hospital' },
                    ].map(({ icon: Icon, label, value }) => (
                        <div key={label} className="flex flex-col items-center text-center gap-3 p-6 rounded-2xl bg-slate-900/50 border border-slate-800 hover:border-teal-500/30 transition-colors duration-200">
                            <div className="w-12 h-12 rounded-xl bg-teal-500/15 flex items-center justify-center">
                                <Icon className="w-5 h-5 text-teal-400" />
                            </div>
                            <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">{label}</p>
                            <p className="text-sm font-medium text-slate-200">{value}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* ── FOOTER ─────────────────────────────────────────────── */}
            <footer className="border-t border-slate-800 py-8 px-4 sm:px-6 text-center text-xs text-slate-600">
                <div className="flex items-center justify-center gap-2 mb-2">
                    <Activity className="w-3.5 h-3.5 text-teal-500" />
                    <span className="text-slate-400 font-semibold">MediCore General Hospital</span>
                </div>
                © {new Date().getFullYear()} MediCore General Hospital. All rights reserved. &nbsp;|&nbsp; Designed for compassionate care.
            </footer>
        </div>
    );
}
