import React, { useState, useEffect } from 'react';
import {
    BedDouble, HeartPulse, CheckCircle2, X, Info,
    Thermometer, Droplets, Activity, Clock, Building2,
    CalendarDays, DollarSign, User, AlertCircle, Plus
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

const INITIAL_ADMISSIONS = [
    {
        id: 1, admission_code: 'ADM-2026-101', patient_name: 'James Wilson',
        patient_code: 'PAT-2026-0001', department: 'Cardiology', room_type: 'ICU',
        bed_number: 'ICU-04', admit_date: '2026-10-10', daily_rate: 450.00,
        status: 'ADMITTED', vitals_last_checked: '10 mins ago',
        bp: '135/88', o2: '98%', temp: '98.6°F', pulse: '76 bpm',
        doctor_name: 'Dr. Robert Smith'
    },
    {
        id: 2, admission_code: 'ADM-2026-102', patient_name: 'Sophia Martinez',
        patient_code: 'PAT-2026-0004', department: 'Orthopedics', room_type: 'General Ward',
        bed_number: 'GW-12', admit_date: '2026-10-09', daily_rate: 150.00,
        status: 'ADMITTED', vitals_last_checked: '1 hour ago',
        bp: '120/78', o2: '99%', temp: '98.2°F', pulse: '72 bpm',
        doctor_name: 'Dr. Sarah Jenkins'
    },
    {
        id: 3, admission_code: 'ADM-2026-098', patient_name: 'Liam Vance',
        patient_code: 'PAT-2026-0003', department: 'Pediatrics', room_type: 'Private Deluxe',
        bed_number: 'DLX-02', admit_date: '2026-10-05', discharge_date: '2026-10-08',
        daily_rate: 280.00, status: 'DISCHARGED', vitals_last_checked: 'Discharged',
        bp: '110/70', o2: '100%', temp: '98.4°F', pulse: '68 bpm',
        doctor_name: 'Dr. Sarah Jenkins'
    },
];

const INITIAL_APPOINTMENTS = [
    { patient_code: 'PAT-2026-0001', doctor_name: 'Dr. Robert Smith' },
    { patient_code: 'PAT-2026-0002', doctor_name: 'Dr. Sarah Jenkins' },
    { patient_code: 'PAT-2026-0003', doctor_name: 'Dr. Sarah Jenkins' },
    { patient_code: 'PAT-2026-0004', doctor_name: 'Dr. Michael Chang' },
];

const DEPARTMENTS = [
    { id: 1, name: 'Cardiology' }, { id: 2, name: 'Pediatrics' },
    { id: 3, name: 'Neurology' }, { id: 4, name: 'Orthopedics' },
    { id: 5, name: 'General Medicine' }
];

const ROOM_COLORS = {
    'ICU': { bg: 'bg-rose-50', border: 'border-rose-200', text: 'text-rose-700', badge: 'bg-rose-100 text-rose-700' },
    'General Ward': { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-700', badge: 'bg-blue-100 text-blue-700' },
    'Private Deluxe': { bg: 'bg-violet-50', border: 'border-violet-200', text: 'text-violet-700', badge: 'bg-violet-100 text-violet-700' },
    'default': { bg: 'bg-teal-50', border: 'border-teal-200', text: 'text-teal-700', badge: 'bg-teal-100 text-teal-700' },
};

function VitalPill({ icon: Icon, label, value, color }) {
    return (
        <div className={`flex flex-col items-center justify-center gap-0.5 rounded-xl py-2.5 px-2 ${color}`}>
            <Icon className="w-3.5 h-3.5 opacity-70" />
            <span className="text-[10px] font-semibold uppercase tracking-wide opacity-60">{label}</span>
            <span className="text-xs font-bold leading-tight">{value || '—'}</span>
        </div>
    );
}

export default function Admissions() {
    const { user, role } = useAuth();
    const isDoctor = role === 'DOCTOR';
    const canManageAdmissions = ['ADMIN', 'NURSE'].includes(role);

    const [admissions, setAdmissions] = useState(INITIAL_ADMISSIONS);
    const [appointments, setAppointments] = useState(INITIAL_APPOINTMENTS);
    const [selectedAdm, setSelectedAdm] = useState(null);
    const [vitalsModal, setVitalsModal] = useState(false);
    const [vitalsForm, setVitalsForm] = useState({ bp: '', o2: '', temp: '', pulse: '' });
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [patients, setPatients] = useState([]);
    const [isAdmissionOpen, setIsAdmissionOpen] = useState(false);
    const [admissionForm, setAdmissionForm] = useState({ patient_id: '', department_id: '1', bed_number: '', room_type: 'General', daily_rate: '100', diagnosis: '' });
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await api.get('/admissions');
                if (res.data?.admissions?.length > 0) setAdmissions(res.data.admissions);
            } catch (e) { /* keep fallback */ }
            try {
                const aptRes = await api.get('/appointments');
                if (aptRes.data?.appointments?.length > 0) setAppointments(aptRes.data.appointments);
            } catch (e) { /* keep fallback */ }
            if (canManageAdmissions) {
                try {
                    const patientsRes = await api.get('/patients');
                    setPatients(patientsRes.data?.patients || []);
                } catch (e) { /* admission form remains unavailable without patients */ }
            }
        };
        fetchData();
    }, [canManageAdmissions]);

    const doctorPatientCodes = isDoctor
        ? new Set(
            appointments
                .filter(a => {
                    const dn = (a.doctor_name || '').toLowerCase();
                    const un = (user?.username || user?.name || user?.full_name || '').toLowerCase();
                    return dn.includes(un) || un.includes(dn.replace('dr. ', ''));
                })
                .map(a => a.patient_code)
        )
        : null;

    const scopedAdmissions = isDoctor && doctorPatientCodes
        ? admissions.filter(a =>
            doctorPatientCodes.has(a.patient_code) ||
            (a.doctor_name || '').toLowerCase().includes(
                (user?.username || user?.name || user?.full_name || '').toLowerCase()
            )
        )
        : admissions;

    const visibleAdmissions = statusFilter === 'ALL'
        ? scopedAdmissions
        : scopedAdmissions.filter(a => a.status === statusFilter);

    const admittedCount = scopedAdmissions.filter(a => a.status === 'ADMITTED').length;
    const dischargedCount = scopedAdmissions.filter(a => a.status === 'DISCHARGED').length;
    const totalBeds = 42;
    const availableBeds = totalBeds - admittedCount;

    const handleOpenVitals = (adm) => {
        setSelectedAdm(adm);
        setVitalsForm({ bp: adm.bp || '120/80', o2: adm.o2 || '98%', temp: adm.temp || '98.6°F', pulse: adm.pulse || '76 bpm' });
        setVitalsModal(true);
    };

    const refreshAdmissions = async () => {
        const res = await api.get('/admissions');
        setAdmissions(res.data?.admissions || []);
    };

    const handleSaveVitals = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            await api.post(`/admissions/${selectedAdm.id}/vitals`, vitalsForm);
            await refreshAdmissions();
            setVitalsModal(false);
        } finally { setSaving(false); }
    };

    const handleDischarge = async (id) => {
        if (!window.confirm('Discharge this patient?')) return;
        await api.patch(`/admissions/${id}/discharge`);
        await refreshAdmissions();
    };

    const handleCreateAdmission = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            await api.post('/admissions', admissionForm);
            await refreshAdmissions();
            setIsAdmissionOpen(false);
            setAdmissionForm({ patient_id: '', department_id: '1', bed_number: '', room_type: 'General', daily_rate: '100', diagnosis: '' });
        } finally { setSaving(false); }
    };

    return (
        <div className="space-y-6">

            {/* ── Page Header ── */}
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 tracking-tight">
                        {isDoctor ? 'My Patients — Admissions & Vitals' : 'Admissions & Inpatient Vitals'}
                    </h1>
                    <p className="text-sm text-slate-500 mt-0.5">
                        {isDoctor
                            ? 'Admitted patients under your care with latest vital signs'
                            : 'Monitor bed occupancy, ward allocation and nurse vitals logs'}
                    </p>
                </div>

                {/* Stat chips */}
                <div className="flex flex-wrap gap-2 text-xs font-semibold shrink-0">
                    {canManageAdmissions && (
                        <button onClick={() => setIsAdmissionOpen(true)} className="inline-flex items-center gap-1.5 bg-teal-600 text-white px-3 py-2 rounded-xl hover:bg-teal-700">
                            <Plus className="w-3.5 h-3.5" /> New Admission
                        </button>
                    )}
                    <div className="flex items-center gap-1.5 bg-emerald-50 border border-emerald-200 text-emerald-700 px-3 py-2 rounded-xl">
                        <BedDouble className="w-3.5 h-3.5" />
                        Available Beds: <span className="font-black">{availableBeds}</span>
                    </div>
                    <div className="flex items-center gap-1.5 bg-rose-50 border border-rose-200 text-rose-700 px-3 py-2 rounded-xl">
                        <Activity className="w-3.5 h-3.5" />
                        Occupied Beds: <span className="font-black">{admittedCount}</span>
                    </div>
                </div>
            </div>

            {/* ── Summary Bar ── */}
            <div className="grid grid-cols-3 gap-3">
                {[
                    { label: 'Total Admissions', value: scopedAdmissions.length, color: 'text-slate-700', bg: 'bg-slate-50 border-slate-200' },
                    { label: 'Currently Admitted', value: admittedCount, color: 'text-amber-700', bg: 'bg-amber-50 border-amber-200' },
                    { label: 'Discharged', value: dischargedCount, color: 'text-slate-500', bg: 'bg-slate-50 border-slate-200' },
                ].map(s => (
                    <div key={s.label} className={`rounded-xl border px-4 py-3 flex flex-col gap-0.5 ${s.bg}`}>
                        <span className={`text-2xl font-black ${s.color}`}>{s.value}</span>
                        <span className="text-[11px] text-slate-500 font-medium">{s.label}</span>
                    </div>
                ))}
            </div>

            {/* ── Status Filter Tabs ── */}
            <div className="flex gap-2">
                {['ALL', 'ADMITTED', 'DISCHARGED'].map(tab => (
                    <button
                        key={tab}
                        onClick={() => setStatusFilter(tab)}
                        className={`px-4 py-1.5 rounded-full text-xs font-semibold border transition ${statusFilter === tab
                            ? 'bg-teal-600 border-teal-600 text-white shadow-sm'
                            : 'bg-white border-slate-200 text-slate-600 hover:border-teal-400 hover:text-teal-600'
                            }`}
                    >
                        {tab === 'ALL' ? 'All' : tab.charAt(0) + tab.slice(1).toLowerCase()}
                        {tab === 'ADMITTED' && admittedCount > 0 && (
                            <span className={`ml-1.5 inline-flex items-center justify-center w-4 h-4 rounded-full text-[9px] font-black ${statusFilter === tab ? 'bg-white text-teal-600' : 'bg-amber-100 text-amber-700'
                                }`}>{admittedCount}</span>
                        )}
                    </button>
                ))}
            </div>

            {/* ── Cards Grid ── */}
            {visibleAdmissions.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 rounded-2xl border border-dashed border-slate-200 bg-slate-50 text-slate-400">
                    <BedDouble className="w-12 h-12 text-slate-300 mb-3" />
                    <p className="text-sm font-semibold text-slate-500">No admissions found</p>
                    <p className="text-xs mt-1">Try switching the status filter above</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                    {visibleAdmissions.map((adm) => {
                        const theme = ROOM_COLORS[adm.room_type] || ROOM_COLORS['default'];
                        const isAdmitted = adm.status === 'ADMITTED';
                        return (
                            <div
                                key={adm.id}
                                className={`relative rounded-2xl flex flex-col overflow-hidden transition hover:shadow-lg ${isAdmitted
                                        ? 'bg-white border border-slate-200 shadow-sm'
                                        : 'bg-violet-50 border-2 border-violet-400 shadow-md'
                                    }`}
                            >
                                {/* Top accent bar */}
                                <div className={`h-1.5 w-full ${isAdmitted ? 'bg-gradient-to-r from-teal-400 to-cyan-400' : 'bg-gradient-to-r from-violet-500 to-purple-400'}`} />

                                <div className="p-5 flex flex-col gap-4 flex-1">
                                    {/* ── Card Header ── */}
                                    <div className="flex items-start justify-between gap-2">
                                        <div>
                                            <span className="font-mono text-[11px] font-bold text-teal-600 bg-teal-50 px-2 py-0.5 rounded-md">
                                                {adm.admission_code}
                                            </span>
                                            <h3 className="mt-2 font-bold text-slate-800 text-base leading-tight">{adm.patient_name}</h3>
                                            <p className="text-[11px] text-slate-400 font-mono">{adm.patient_code}</p>
                                        </div>
                                        <span className={`shrink-0 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wide ${isAdmitted
                                            ? 'bg-amber-100 text-amber-800 border border-amber-200'
                                            : 'bg-slate-100 text-slate-500 border border-slate-200'
                                            }`}>
                                            {adm.status}
                                        </span>
                                    </div>

                                    {/* ── Ward & Details ── */}
                                    <div className={`rounded-xl border p-3 space-y-2 text-xs ${theme.bg} ${theme.border}`}>
                                        <div className="flex items-center gap-2">
                                            <Building2 className={`w-3.5 h-3.5 shrink-0 ${theme.text}`} />
                                            <span className="text-slate-500 w-20 shrink-0">Ward & Bed</span>
                                            <strong className="text-slate-800 truncate">{adm.room_type} <span className="text-slate-400">({adm.bed_number})</span></strong>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <CalendarDays className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                            <span className="text-slate-500 w-20 shrink-0">Admit Date</span>
                                            <span className="text-slate-700">{new Date(adm.admit_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <DollarSign className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                            <span className="text-slate-500 w-20 shrink-0">Daily Rate</span>
                                            <strong className="text-teal-700">${adm.daily_rate}<span className="font-normal text-slate-400">/day</span></strong>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                            <span className="text-slate-500 w-20 shrink-0">Department</span>
                                            <span className="text-slate-700">{adm.department}</span>
                                        </div>
                                    </div>

                                    {/* ── Vitals Strip ── */}
                                    <div>
                                        <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide mb-2">Latest Vitals</p>
                                        <div className="grid grid-cols-4 gap-1.5">
                                            <VitalPill icon={Activity} label="BP" value={adm.bp} color="bg-rose-50 text-rose-700" />
                                            <VitalPill icon={Droplets} label="SpO₂" value={adm.o2} color="bg-sky-50 text-sky-700" />
                                            <VitalPill icon={Thermometer} label="Temp" value={adm.temp} color="bg-orange-50 text-orange-700" />
                                            <VitalPill icon={HeartPulse} label="Pulse" value={adm.pulse} color="bg-emerald-50 text-emerald-700" />
                                        </div>
                                        <p className="text-[10px] text-slate-400 mt-1.5 text-right flex justify-end items-center gap-1">
                                            <Clock className="w-3 h-3" /> {adm.vitals_last_checked}
                                        </p>
                                    </div>

                                    {/* ── Action Buttons ── */}
                                    {isAdmitted && canManageAdmissions && (
                                        <div className="flex gap-2 pt-1 border-t border-slate-100 mt-auto">
                                            <button
                                                onClick={() => handleOpenVitals(adm)}
                                                className="flex-1 inline-flex items-center justify-center gap-1.5 text-xs font-semibold bg-rose-50 text-rose-700 hover:bg-rose-100 active:bg-rose-200 px-3 py-2 rounded-xl transition"
                                            >
                                                <HeartPulse className="w-3.5 h-3.5" />
                                                Record Vitals
                                            </button>
                                            <button onClick={() => handleDischarge(adm.id)} className="flex-1 inline-flex items-center justify-center gap-1.5 text-xs font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 active:bg-slate-300 px-3 py-2 rounded-xl transition">
                                                <CheckCircle2 className="w-3.5 h-3.5" /> Discharge
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* ── Vitals Modal ── */}
            {vitalsModal && (
                <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm border border-slate-100 overflow-hidden">
                        {/* Modal header */}
                        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-slate-50">
                            <div className="flex items-center gap-2.5">
                                <div className="w-8 h-8 rounded-lg bg-rose-100 flex items-center justify-center">
                                    <HeartPulse className="w-4 h-4 text-rose-600" />
                                </div>
                                <div>
                                    <h3 className="text-sm font-bold text-slate-800">Record Vitals</h3>
                                    <p className="text-[11px] text-slate-500">{selectedAdm?.patient_name}</p>
                                </div>
                            </div>
                            <button onClick={() => setVitalsModal(false)} className="text-slate-400 hover:text-slate-600 rounded-lg p-1 hover:bg-slate-100 transition">
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Modal form */}
                        <form onSubmit={handleSaveVitals} className="p-5 space-y-3">
                            {[
                                { key: 'bp', label: 'Blood Pressure', placeholder: '120/80', icon: Activity },
                                { key: 'o2', label: 'Oxygen Saturation (SpO₂)', placeholder: '98%', icon: Droplets },
                                { key: 'temp', label: 'Temperature', placeholder: '98.6°F', icon: Thermometer },
                                { key: 'pulse', label: 'Pulse (bpm)', placeholder: '76 bpm', icon: HeartPulse },
                            ].map(({ key, label, placeholder, icon: Icon }) => (
                                <div key={key}>
                                    <label className="block text-xs font-semibold text-slate-500 mb-1">{label}</label>
                                    <div className="relative">
                                        <Icon className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                                        <input
                                            type="text"
                                            placeholder={placeholder}
                                            value={vitalsForm[key]}
                                            onChange={(e) => setVitalsForm({ ...vitalsForm, [key]: e.target.value })}
                                            className="w-full pl-8 pr-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 bg-slate-50"
                                        />
                                    </div>
                                </div>
                            ))}
                            <div className="flex gap-2 pt-1">
                                <button
                                    type="button"
                                    onClick={() => setVitalsModal(false)}
                                    className="flex-1 px-3 py-2 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit" disabled={saving}
                                    className="flex-1 px-4 py-2 text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white rounded-xl shadow-sm transition"
                                >
                                    {saving ? 'Saving...' : 'Save Vitals'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {isAdmissionOpen && (
                <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-5">
                        <div className="flex justify-between items-center mb-4"><h3 className="font-bold text-slate-800">New Admission</h3><button onClick={() => setIsAdmissionOpen(false)}><X className="w-5 h-5" /></button></div>
                        <form onSubmit={handleCreateAdmission} className="space-y-3">
                            <select required value={admissionForm.patient_id} onChange={e => setAdmissionForm({ ...admissionForm, patient_id: e.target.value })} className="w-full border rounded-xl p-2 text-sm"><option value="">Select patient</option>{patients.map(p => <option key={p.id} value={p.id}>{p.full_name} ({p.patient_code})</option>)}</select>
                            <select value={admissionForm.department_id} onChange={e => setAdmissionForm({ ...admissionForm, department_id: e.target.value })} className="w-full border rounded-xl p-2 text-sm">{DEPARTMENTS.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}</select>
                            <div className="grid grid-cols-2 gap-3"><input required placeholder="Bed number" value={admissionForm.bed_number} onChange={e => setAdmissionForm({ ...admissionForm, bed_number: e.target.value })} className="border rounded-xl p-2 text-sm" /><select value={admissionForm.room_type} onChange={e => setAdmissionForm({ ...admissionForm, room_type: e.target.value })} className="border rounded-xl p-2 text-sm">{['General', 'Semi-Private', 'Private', 'ICU'].map(type => <option key={type}>{type}</option>)}</select></div>
                            <input type="number" min="0" step="0.01" placeholder="Daily rate" value={admissionForm.daily_rate} onChange={e => setAdmissionForm({ ...admissionForm, daily_rate: e.target.value })} className="w-full border rounded-xl p-2 text-sm" />
                            <textarea placeholder="Admission diagnosis / notes" value={admissionForm.diagnosis} onChange={e => setAdmissionForm({ ...admissionForm, diagnosis: e.target.value })} className="w-full border rounded-xl p-2 text-sm" rows="2" />
                            <button disabled={saving || patients.length === 0} className="w-full bg-teal-600 text-white rounded-xl py-2 text-sm font-semibold disabled:opacity-50">{saving ? 'Creating...' : 'Create Admission'}</button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
