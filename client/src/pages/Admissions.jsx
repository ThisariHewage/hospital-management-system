import React, { useState } from 'react';
import { BedDouble, HeartPulse, User, Clock, CheckCircle2, Plus, X } from 'lucide-react';

const INITIAL_ADMISSIONS = [
    { id: 1, admission_code: 'ADM-2026-101', patient_name: 'James Wilson', patient_code: 'PAT-2026-0001', department: 'Cardiology', room_type: 'ICU', bed_number: 'ICU-04', admit_date: '2026-10-10', daily_rate: 450.00, status: 'ADMITTED', vitals_last_checked: '10 mins ago', bp: '135/88', o2: '98%' },
    { id: 2, admission_code: 'ADM-2026-102', patient_name: 'Sophia Martinez', patient_code: 'PAT-2026-0004', department: 'Orthopedics', room_type: 'General Ward', bed_number: 'GW-12', admit_date: '2026-10-09', daily_rate: 150.00, status: 'ADMITTED', vitals_last_checked: '1 hour ago', bp: '120/78', o2: '99%' },
    { id: 3, admission_code: 'ADM-2026-098', patient_name: 'Liam Vance', patient_code: 'PAT-2026-0003', department: 'Pediatrics', room_type: 'Private Deluxe', bed_number: 'DLX-02', admit_date: '2026-10-05', discharge_date: '2026-10-08', daily_rate: 280.00, status: 'DISCHARGED', vitals_last_checked: 'Discharged', bp: '110/70', o2: '100%' },
];

export default function Admissions() {
    const [admissions, setAdmissions] = useState(INITIAL_ADMISSIONS);
    const [selectedAdm, setSelectedAdm] = useState(null);
    const [vitalsModal, setVitalsModal] = useState(false);
    const [vitalsForm, setVitalsForm] = useState({ bp: '', o2: '', temp: '', pulse: '' });

    const handleOpenVitals = (adm) => {
        setSelectedAdm(adm);
        setVitalsForm({ bp: adm.bp || '120/80', o2: adm.o2 || '98%', temp: '98.6 °F', pulse: '76 bpm' });
        setVitalsModal(true);
    };

    const handleSaveVitals = (e) => {
        e.preventDefault();
        setAdmissions(admissions.map(a => a.id === selectedAdm.id ? { ...a, bp: vitalsForm.bp, o2: vitalsForm.o2, vitals_last_checked: 'Just now' } : a));
        setVitalsModal(false);
    };

    const handleDischarge = (id) => {
        setAdmissions(admissions.map(a => a.id === id ? { ...a, status: 'DISCHARGED' } : a));
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Admissions & Inpatient Vitals</h1>
                    <p className="text-sm text-slate-500">Monitor bed occupancy, ward allocation and regular nurse vitals logs</p>
                </div>
                <div className="flex items-center space-x-2 text-xs font-semibold">
                    <span className="bg-emerald-100 text-emerald-800 px-3 py-1.5 rounded-lg">Available Beds: 28</span>
                    <span className="bg-rose-100 text-rose-800 px-3 py-1.5 rounded-lg">Occupied Beds: 14</span>
                </div>
            </div>

            {/* Inpatients Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {admissions.map((adm) => (
                    <div key={adm.id} className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm flex flex-col justify-between">
                        <div>
                            <div className="flex items-center justify-between mb-3">
                                <span className="font-mono text-xs font-bold text-teal-600 bg-teal-50 px-2 py-0.5 rounded">
                                    {adm.admission_code}
                                </span>
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${adm.status === 'ADMITTED' ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-600'
                                    }`}>
                                    {adm.status}
                                </span>
                            </div>

                            <h3 className="font-bold text-slate-800 text-base">{adm.patient_name}</h3>
                            <p className="text-xs text-slate-400 font-mono mb-3">{adm.patient_code}</p>

                            <div className="space-y-2 text-xs bg-slate-50 p-3 rounded-lg border border-slate-100">
                                <div className="flex justify-between">
                                    <span className="text-slate-500">Ward & Bed:</span>
                                    <strong className="text-slate-800">{adm.room_type} ({adm.bed_number})</strong>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-500">Admit Date:</span>
                                    <span>{new Date(adm.admit_date).toLocaleDateString()}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-500">Daily Rate:</span>
                                    <strong className="text-teal-700">${adm.daily_rate}/day</strong>
                                </div>
                                <div className="pt-2 border-t border-slate-200/60 flex justify-between items-center text-rose-700 font-medium">
                                    <span>Latest Vitals:</span>
                                    <span>BP: {adm.bp} • O₂: {adm.o2}</span>
                                </div>
                            </div>
                        </div>

                        {adm.status === 'ADMITTED' && (
                            <div className="mt-4 pt-3 border-t border-slate-100 flex justify-end space-x-2">
                                <button
                                    onClick={() => handleOpenVitals(adm)}
                                    className="inline-flex items-center space-x-1 text-xs font-semibold bg-rose-50 text-rose-700 hover:bg-rose-100 px-2.5 py-1.5 rounded-lg transition"
                                >
                                    <HeartPulse className="w-3.5 h-3.5" />
                                    <span>Record Vitals</span>
                                </button>
                                <button
                                    onClick={() => handleDischarge(adm.id)}
                                    className="inline-flex items-center space-x-1 text-xs font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 px-2.5 py-1.5 rounded-lg transition"
                                >
                                    <CheckCircle2 className="w-3.5 h-3.5" />
                                    <span>Discharge</span>
                                </button>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* Vitals Recording Modal */}
            {vitalsModal && (
                <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 border border-slate-200">
                        <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
                            <h3 className="text-base font-bold text-slate-800">Nurse Vitals Check: {selectedAdm?.patient_name}</h3>
                            <button onClick={() => setVitalsModal(false)} className="text-slate-400 hover:text-slate-600">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <form onSubmit={handleSaveVitals} className="space-y-3">
                            <div>
                                <label className="block text-xs font-semibold text-slate-500 mb-1">Blood Pressure</label>
                                <input
                                    type="text"
                                    value={vitalsForm.bp}
                                    onChange={(e) => setVitalsForm({ ...vitalsForm, bp: e.target.value })}
                                    className="w-full text-sm border rounded-lg px-3 py-2"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-slate-500 mb-1">Oxygen Saturation (SpO₂)</label>
                                <input
                                    type="text"
                                    value={vitalsForm.o2}
                                    onChange={(e) => setVitalsForm({ ...vitalsForm, o2: e.target.value })}
                                    className="w-full text-sm border rounded-lg px-3 py-2"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-slate-500 mb-1">Temperature</label>
                                <input
                                    type="text"
                                    value={vitalsForm.temp}
                                    onChange={(e) => setVitalsForm({ ...vitalsForm, temp: e.target.value })}
                                    className="w-full text-sm border rounded-lg px-3 py-2"
                                />
                            </div>
                            <div className="pt-2 flex justify-end space-x-2">
                                <button type="button" onClick={() => setVitalsModal(false)} className="px-3 py-1.5 text-xs text-slate-600">
                                    Cancel
                                </button>
                                <button type="submit" className="px-4 py-1.5 text-xs bg-rose-600 hover:bg-rose-700 text-white font-semibold rounded-lg shadow-sm">
                                    Save Vitals
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
