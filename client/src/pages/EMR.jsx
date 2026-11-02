import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { Stethoscope, User, HeartPulse, Pill, Plus, Trash2, CheckCircle2, History, AlertCircle, Printer, X } from 'lucide-react';

const AVAILABLE_MEDS = [
    { id: 1, name: 'Amoxicillin 500mg', category: 'Antibiotics' },
    { id: 2, name: 'Paracetamol 650mg', category: 'Analgesics' },
    { id: 3, name: 'Atorvastatin 20mg', category: 'Cardiovascular' },
    { id: 4, name: 'Metformin 850mg', category: 'Antidiabetic' },
    { id: 5, name: 'Azithromycin 250mg', category: 'Antibiotics' },
    { id: 6, name: 'Ibuprofen 400mg', category: 'NSAID' }
];

export default function EMR() {
    const { role } = useAuth();
    const [patients, setPatients] = useState([]);
    const [selectedPatientId, setSelectedPatientId] = useState('');
    const [symptoms, setSymptoms] = useState('Mild palpitations after exertion, slight dyspnea');
    const [diagnosis, setDiagnosis] = useState('Stage 1 Hypertension • Early Cardiovascular Evaluation');
    const [treatmentPlan, setTreatmentPlan] = useState('Low sodium diet, moderate cardio 30 min/day, follow up in 3 weeks');

    // Vitals
    const [vitals, setVitals] = useState({
        bp: '135/88 mmHg',
        pulse: '78 bpm',
        temperature: '98.6 °F',
        weight: '74 kg'
    });

    // Prescriptions builder
    const [prescriptions, setPrescriptions] = useState([
        { id: 1, medicine_id: 3, medicine_name: 'Atorvastatin 20mg', dosage: '1 tablet', frequency: 'Once daily (Night)', duration: '30 days', instructions: 'Take after dinner' },
        { id: 2, medicine_id: 2, medicine_name: 'Paracetamol 650mg', dosage: '1 tablet', frequency: 'As needed', duration: '5 days', instructions: 'Take for mild headache' }
    ]);

    const [savedSuccess, setSavedSuccess] = useState(false);
    const [saveError, setSaveError] = useState('');
    const [loading, setLoading] = useState(false);
    const [records, setRecords] = useState([]);
    const [showHistory, setShowHistory] = useState(false);

    useEffect(() => {
        const fetchPatients = async () => {
            try {
                const res = await api.get('/emr/consultation-patients');
                setPatients(res.data?.patients || []);
                setSelectedPatientId(res.data?.patients?.[0]?.id?.toString() || '');
            } catch (e) {
                setPatients([]);
                setSelectedPatientId('');
            }
        };
        fetchPatients();
    }, []);

    const selectedPatient = patients.find(p => p.id === Number(selectedPatientId));

    const loadHistory = async () => {
        if (!selectedPatientId) return;
        try {
            const res = await api.get(`/emr?patient_id=${selectedPatientId}`);
            setRecords(res.data?.records || []);
            setShowHistory(true);
        } catch (error) { setSaveError(error.response?.data?.message || 'Unable to load treatment history.'); }
    };

    const printReport = (record) => {
        let details = {};
        try { details = typeof record.notes === 'string' ? JSON.parse(record.notes || '{}') : (record.notes || {}); } catch { details = {}; }
        const vitalsText = Object.entries(details.vitals || {}).map(([key, value]) => `${key}: ${value}`).join(' | ') || 'Not recorded';
        const medications = (details.prescriptions || []).map(item => `<li>${item.medicine_name} — ${item.dosage}, ${item.frequency}, ${item.duration}</li>`).join('') || '<li>No prescriptions recorded</li>';
        const report = window.open('', '_blank', 'width=800,height=900');
        if (!report) return;
        report.document.write(`<html><head><title>Medical Report</title><style>body{font-family:Arial;padding:40px;color:#1e293b}h1{color:#0f766e}h2{border-bottom:1px solid #ccc;padding-bottom:6px}p{line-height:1.5}.meta{color:#475569}</style></head><body><h1>MediCore Hospital — Medical Report</h1><p class="meta">Patient: <b>${record.patient_name}</b> (${record.patient_code})<br>Consulting Doctor: ${record.doctor_name}<br>Visit: ${new Date(record.visit_date).toLocaleString()}</p><h2>Diagnosis</h2><p>${record.diagnosis}</p><h2>Symptoms</h2><p>${record.symptoms || 'Not recorded'}</p><h2>Vital Signs</h2><p>${vitalsText}</p><h2>Treatment Plan</h2><p>${record.treatment_plan || 'Not recorded'}</p><h2>Electronic Prescriptions</h2><ul>${medications}</ul><script>window.print()</script></body></html>`);
        report.document.close();
    };

    const addPrescriptionItem = () => {
        const newItem = {
            id: Date.now(),
            medicine_id: 1,
            medicine_name: 'Amoxicillin 500mg',
            dosage: '1 capsule',
            frequency: 'Twice daily',
            duration: '7 days',
            instructions: 'Take after meals'
        };
        setPrescriptions([...prescriptions, newItem]);
    };

    const removePrescription = (id) => {
        setPrescriptions(prescriptions.filter(p => p.id !== id));
    };

    const handleSaveConsultation = async (e) => {
        e.preventDefault();
        setLoading(true);
        setSaveError('');
        try {
            await api.post('/emr', {
                patient_id: selectedPatientId,
                symptoms,
                diagnosis,
                treatment_plan: treatmentPlan,
                vitals,
                prescriptions
            });
            setSavedSuccess(true);
            setTimeout(() => setSavedSuccess(false), 4000);
        } catch (err) {
            setSaveError(err.response?.data?.message || 'Unable to save the consultation. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 tracking-tight">EMR Consultation Desk</h1>
                    <p className="text-sm text-slate-500">Record clinical diagnosis, vital measurements and electronic prescriptions</p>
                </div>
                {savedSuccess && (
                    <div className="inline-flex items-center space-x-2 bg-emerald-50 text-emerald-700 border border-emerald-200 px-3 py-1.5 rounded-lg text-xs font-semibold">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span>Consultation & Prescriptions Saved to Medical Record!</span>
                    </div>
                )}
            </div>

            {selectedPatient && <div className="flex justify-end"><button type="button" onClick={loadHistory} className="inline-flex items-center gap-1.5 text-xs font-semibold bg-slate-100 text-slate-700 px-3 py-2 rounded-lg hover:bg-slate-200"><History className="w-3.5 h-3.5" /> View Treatment History & Reports</button></div>}

            {/* Patient Selector Strip */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex items-center space-x-3 w-full md:w-auto">
                    <User className="w-5 h-5 text-teal-600" />
                    <div>
                        <label className="text-[10px] font-bold uppercase text-slate-400 block">Select In-Consultation Patient</label>
                        <select
                            value={selectedPatientId}
                            onChange={(e) => setSelectedPatientId(e.target.value)}
                            className="text-sm font-semibold text-slate-800 bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-teal-500"
                            disabled={patients.length === 0}
                        >
                            {patients.length === 0 && <option value="">No scheduled patients assigned</option>}
                            {patients.map(p => (
                                <option key={p.id} value={p.id}>{p.full_name} ({p.patient_code})</option>
                            ))}
                        </select>
                    </div>
                </div>

                {role === 'DOCTOR' && patients.length === 0 && (
                    <p className="text-xs text-slate-500">You have no scheduled consultations.</p>
                )}
                {saveError && <p className="text-xs font-semibold text-rose-600">{saveError}</p>}

                {selectedPatient && (
                    <div className="flex flex-wrap items-center gap-3 text-xs">
                        <div className="bg-teal-50 text-teal-800 px-3 py-1.5 rounded-lg font-medium">
                            Code: <span className="font-mono font-bold">{selectedPatient.patient_code}</span>
                        </div>
                        <div className="bg-rose-50 text-rose-800 px-3 py-1.5 rounded-lg font-medium">
                            Blood Group: <strong className="font-bold">{selectedPatient.blood_group}</strong>
                        </div>
                        <div className="bg-slate-100 text-slate-700 px-3 py-1.5 rounded-lg font-medium">
                            Gender: <strong>{selectedPatient.gender}</strong>
                        </div>
                    </div>
                )}
            </div>

            <form onSubmit={handleSaveConsultation} className="space-y-6">
                {/* 1. Vitals Signs Section */}
                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                    <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700 mb-3 flex items-center space-x-2">
                        <HeartPulse className="w-4 h-4 text-rose-500" />
                        <span>1. Patient Vital Signs</span>
                    </h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                            <label className="block text-xs text-slate-500 mb-1">Blood Pressure (mmHg)</label>
                            <input
                                type="text"
                                value={vitals.bp}
                                onChange={(e) => setVitals({ ...vitals, bp: e.target.value })}
                                className="w-full text-sm font-medium border border-slate-200 rounded-lg px-3 py-2 bg-slate-50 focus:ring-2 focus:ring-teal-500"
                                placeholder="120/80"
                            />
                        </div>
                        <div>
                            <label className="block text-xs text-slate-500 mb-1">Pulse / Heart Rate</label>
                            <input
                                type="text"
                                value={vitals.pulse}
                                onChange={(e) => setVitals({ ...vitals, pulse: e.target.value })}
                                className="w-full text-sm font-medium border border-slate-200 rounded-lg px-3 py-2 bg-slate-50 focus:ring-2 focus:ring-teal-500"
                                placeholder="72 bpm"
                            />
                        </div>
                        <div>
                            <label className="block text-xs text-slate-500 mb-1">Body Temperature</label>
                            <input
                                type="text"
                                value={vitals.temperature}
                                onChange={(e) => setVitals({ ...vitals, temperature: e.target.value })}
                                className="w-full text-sm font-medium border border-slate-200 rounded-lg px-3 py-2 bg-slate-50 focus:ring-2 focus:ring-teal-500"
                                placeholder="98.6 °F"
                            />
                        </div>
                        <div>
                            <label className="block text-xs text-slate-500 mb-1">Body Weight (kg)</label>
                            <input
                                type="text"
                                value={vitals.weight}
                                onChange={(e) => setVitals({ ...vitals, weight: e.target.value })}
                                className="w-full text-sm font-medium border border-slate-200 rounded-lg px-3 py-2 bg-slate-50 focus:ring-2 focus:ring-teal-500"
                                placeholder="70 kg"
                            />
                        </div>
                    </div>
                </div>

                {/* 2. Clinical Findings & Assessment */}
                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
                    <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700 flex items-center space-x-2">
                        <Stethoscope className="w-4 h-4 text-teal-600" />
                        <span>2. Clinical Assessment & Diagnosis</span>
                    </h2>
                    <div>
                        <label className="block text-xs font-semibold text-slate-600 mb-1">Symptoms & Chief Complaints</label>
                        <textarea
                            rows="2"
                            value={symptoms}
                            onChange={(e) => setSymptoms(e.target.value)}
                            className="w-full text-sm border border-slate-200 rounded-lg p-3 bg-slate-50 focus:ring-2 focus:ring-teal-500"
                            placeholder="Describe patient reported symptoms..."
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-slate-600 mb-1">Doctor's Diagnosis *</label>
                        <input
                            type="text"
                            required
                            value={diagnosis}
                            onChange={(e) => setDiagnosis(e.target.value)}
                            className="w-full text-sm font-semibold border border-slate-200 rounded-lg px-3 py-2 bg-slate-50 focus:ring-2 focus:ring-teal-500 text-teal-900"
                            placeholder="Primary clinical diagnosis..."
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-slate-600 mb-1">Treatment Plan & Clinical Notes</label>
                        <textarea
                            rows="2"
                            value={treatmentPlan}
                            onChange={(e) => setTreatmentPlan(e.target.value)}
                            className="w-full text-sm border border-slate-200 rounded-lg p-3 bg-slate-50 focus:ring-2 focus:ring-teal-500"
                            placeholder="Advised care, dietary guidelines, and next appointment schedule..."
                        />
                    </div>
                </div>

                {/* 3. Prescription Builder */}
                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700 flex items-center space-x-2">
                            <Pill className="w-4 h-4 text-emerald-600" />
                            <span>3. Electronic Prescription</span>
                        </h2>
                        <button
                            type="button"
                            onClick={addPrescriptionItem}
                            className="inline-flex items-center space-x-1.5 text-xs font-semibold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 px-3 py-1.5 rounded-lg transition"
                        >
                            <Plus className="w-3.5 h-3.5" />
                            <span>Add Medicine</span>
                        </button>
                    </div>

                    <div className="space-y-3">
                        {prescriptions.map((item, index) => (
                            <div key={item.id} className="grid grid-cols-1 md:grid-cols-5 gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200 items-end">
                                <div>
                                    <label className="block text-[10px] font-semibold text-slate-500 mb-1">Medicine</label>
                                    <select
                                        value={item.medicine_id}
                                        onChange={(e) => {
                                            const med = AVAILABLE_MEDS.find(m => m.id === Number(e.target.value));
                                            const updated = [...prescriptions];
                                            updated[index].medicine_id = Number(e.target.value);
                                            updated[index].medicine_name = med ? med.name : '';
                                            setPrescriptions(updated);
                                        }}
                                        className="w-full text-xs border border-slate-300 rounded px-2 py-1.5 bg-white font-medium"
                                    >
                                        {AVAILABLE_MEDS.map(m => (
                                            <option key={m.id} value={m.id}>{m.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-[10px] font-semibold text-slate-500 mb-1">Dosage</label>
                                    <input
                                        type="text"
                                        value={item.dosage}
                                        onChange={(e) => {
                                            const updated = [...prescriptions];
                                            updated[index].dosage = e.target.value;
                                            setPrescriptions(updated);
                                        }}
                                        className="w-full text-xs border border-slate-300 rounded px-2 py-1.5 bg-white"
                                        placeholder="1 tablet"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-semibold text-slate-500 mb-1">Frequency</label>
                                    <input
                                        type="text"
                                        value={item.frequency}
                                        onChange={(e) => {
                                            const updated = [...prescriptions];
                                            updated[index].frequency = e.target.value;
                                            setPrescriptions(updated);
                                        }}
                                        className="w-full text-xs border border-slate-300 rounded px-2 py-1.5 bg-white"
                                        placeholder="Twice daily"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-semibold text-slate-500 mb-1">Duration & Notes</label>
                                    <input
                                        type="text"
                                        value={item.duration}
                                        onChange={(e) => {
                                            const updated = [...prescriptions];
                                            updated[index].duration = e.target.value;
                                            setPrescriptions(updated);
                                        }}
                                        className="w-full text-xs border border-slate-300 rounded px-2 py-1.5 bg-white"
                                        placeholder="7 days (after meal)"
                                    />
                                </div>
                                <div className="flex justify-end">
                                    <button
                                        type="button"
                                        onClick={() => removePrescription(item.id)}
                                        className="text-rose-500 hover:text-rose-700 p-1.5 rounded hover:bg-rose-50"
                                        title="Remove medicine"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Submit button */}
                <div className="flex justify-end space-x-4">
                    <button
                        type="submit"
                        disabled={loading || !selectedPatient}
                        className="bg-gradient-to-r from-teal-600 to-teal-500 hover:from-teal-700 text-white font-semibold px-6 py-2.5 rounded-lg shadow-md shadow-teal-500/20 text-sm transition"
                    >
                        {loading ? 'Saving...' : 'Finalize & Save Consultation'}
                    </button>
                </div>
            </form>

            {showHistory && <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex justify-center items-center p-4"><div className="bg-white w-full max-w-2xl max-h-[85vh] overflow-y-auto rounded-2xl p-6"><div className="flex justify-between border-b pb-3"><div><h2 className="font-bold text-slate-800">Treatment History & Medical Reports</h2><p className="text-xs text-slate-500">{selectedPatient?.full_name}</p></div><button onClick={() => setShowHistory(false)}><X className="w-5 h-5" /></button></div><div className="mt-4 space-y-3">{records.length ? records.map(record => <div key={record.id} className="border rounded-xl p-4"><div className="flex justify-between gap-3"><div><p className="font-semibold text-slate-800">{record.diagnosis}</p><p className="text-xs text-slate-500">{new Date(record.visit_date).toLocaleString()} · {record.doctor_name}</p></div><button onClick={() => printReport(record)} className="inline-flex h-fit items-center gap-1 text-xs text-teal-700 bg-teal-50 px-2.5 py-1.5 rounded-lg"><Printer className="w-3.5 h-3.5" /> Print Report</button></div><p className="mt-2 text-xs text-slate-600"><b>Treatment:</b> {record.treatment_plan || 'Not recorded'}</p></div>) : <p className="text-sm text-slate-500 text-center py-8">No medical records available for this patient.</p>}</div></div></div>}
        </div>
    );
}
