import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { Calendar as CalendarIcon, Clock, User, CheckCircle2, XCircle, Plus, Filter, Search, X } from 'lucide-react';

const INITIAL_APPOINTMENTS = [
    { id: 1, appointment_code: 'APT-1001', patient_name: 'James Wilson', patient_code: 'PAT-2026-0001', doctor_name: 'Dr. Robert Smith', department_name: 'Cardiology', appointment_date: '2026-10-12', time_slot: '09:30 AM', reason: 'Routine cardiovascular follow-up', status: 'SCHEDULED' },
    { id: 2, appointment_code: 'APT-1002', patient_name: 'Eleanor Rigby', patient_code: 'PAT-2026-0002', doctor_name: 'Dr. Sarah Jenkins', department_name: 'Pediatrics', appointment_date: '2026-10-12', time_slot: '10:45 AM', reason: 'Chronic migraine evaluation', status: 'SCHEDULED' },
    { id: 3, appointment_code: 'APT-1003', patient_name: 'Liam Vance', patient_code: 'PAT-2026-0003', doctor_name: 'Dr. Sarah Jenkins', department_name: 'Pediatrics', appointment_date: '2026-10-13', time_slot: '11:15 AM', reason: 'Pediatric annual checkup', status: 'SCHEDULED' },
    { id: 4, appointment_code: 'APT-1004', patient_name: 'Sophia Martinez', patient_code: 'PAT-2026-0004', doctor_name: 'Dr. Michael Chang', department_name: 'Orthopedics', appointment_date: '2026-10-11', time_slot: '02:00 PM', reason: 'Knee joint pain after sprain', status: 'COMPLETED' }
];

const TIME_SLOTS = [
    '09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM', '11:00 AM',
    '11:30 AM', '02:00 PM', '02:30 PM', '03:00 PM', '03:30 PM', '04:00 PM'
];

export default function Appointments() {
    const { user, role } = useAuth();
    const isDoctor = role === 'DOCTOR';
    const [appointments, setAppointments] = useState(INITIAL_APPOINTMENTS);
    const [statusFilter, setStatusFilter] = useState('');
    const [search, setSearch] = useState('');
    const [isBookingOpen, setIsBookingOpen] = useState(false);
    const [doctors, setDoctors] = useState([
        { id: 1, full_name: 'Dr. Robert Smith', department_name: 'Cardiology' },
        { id: 2, full_name: 'Dr. Sarah Jenkins', department_name: 'Pediatrics' },
        { id: 3, full_name: 'Dr. Michael Chang', department_name: 'Orthopedics' }
    ]);
    const [patients, setPatients] = useState([
        { id: 1, full_name: 'James Wilson', patient_code: 'PAT-2026-0001' },
        { id: 2, full_name: 'Eleanor Rigby', patient_code: 'PAT-2026-0002' },
        { id: 3, full_name: 'Liam Vance', patient_code: 'PAT-2026-0003' },
        { id: 4, full_name: 'Sophia Martinez', patient_code: 'PAT-2026-0004' }
    ]);

    // Booking form
    const [formData, setFormData] = useState({
        patient_id: 1,
        doctor_id: 1,
        appointment_date: new Date().toISOString().split('T')[0],
        time_slot: '09:00 AM',
        reason: ''
    });

    const fetchAppointments = async () => {
        try {
            const res = await api.get('/appointments');
            if (res.data?.appointments?.length > 0) {
                setAppointments(res.data.appointments);
            }
            const docRes = await api.get('/doctors');
            if (docRes.data?.doctors?.length > 0) {
                setDoctors(docRes.data.doctors);
            }
            const patRes = await api.get('/patients');
            if (patRes.data?.patients?.length > 0) {
                setPatients(patRes.data.patients);
            }
        } catch (e) {
            console.log('Using local state for appointments');
        }
    };

    useEffect(() => {
        fetchAppointments();
    }, []);

    const handleStatusUpdate = async (id, newStatus) => {
        try {
            await api.patch(`/appointments/${id}/status`, { status: newStatus });
        } catch (e) {
            // Local update
        }
        setAppointments(appointments.map(a => a.id === id ? { ...a, status: newStatus } : a));
    };

    const handleBookAppointment = async (e) => {
        e.preventDefault();
        const selectedPatient = patients.find(p => p.id === Number(formData.patient_id));
        const selectedDoctor = doctors.find(d => d.id === Number(formData.doctor_id));

        const newApt = {
            id: Date.now(),
            appointment_code: `APT-${Math.floor(1000 + Math.random() * 9000)}`,
            patient_name: selectedPatient ? selectedPatient.full_name : 'Patient',
            patient_code: selectedPatient ? selectedPatient.patient_code : 'PAT-2026',
            doctor_name: selectedDoctor ? selectedDoctor.full_name : 'Doctor',
            department_name: selectedDoctor ? selectedDoctor.department_name : 'General',
            appointment_date: formData.appointment_date,
            time_slot: formData.time_slot,
            reason: formData.reason || 'Consultation',
            status: 'SCHEDULED'
        };

        try {
            await api.post('/appointments', formData);
        } catch (e) {
            // offline mode
        }

        setAppointments([newApt, ...appointments]);
        setIsBookingOpen(false);
        setFormData({ ...formData, reason: '' });
    };

    const filtered = appointments.filter(a => {
        const matchesStatus = statusFilter ? a.status === statusFilter : true;
        const matchesSearch =
            a.patient_name?.toLowerCase().includes(search.toLowerCase()) ||
            a.doctor_name?.toLowerCase().includes(search.toLowerCase()) ||
            a.appointment_code?.toLowerCase().includes(search.toLowerCase());
        return matchesStatus && matchesSearch;
    });

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 tracking-tight">
                        {isDoctor ? 'My Appointments' : 'Appointment Scheduling'}
                    </h1>
                    <p className="text-sm text-slate-500">
                        {isDoctor
                            ? `Showing appointments assigned to you, ${user?.full_name || 'Doctor'}`
                            : 'Manage patient consultations, doctor schedules, and clinical queue'}
                    </p>
                </div>
                {!isDoctor && (
                    <button
                        onClick={() => setIsBookingOpen(true)}
                        className="inline-flex items-center space-x-2 bg-gradient-to-r from-teal-600 to-teal-500 hover:from-teal-700 text-white font-medium px-4 py-2.5 rounded-lg shadow-md shadow-teal-500/20 text-sm transition"
                    >
                        <Plus className="w-4 h-4" />
                        <span>Book Appointment</span>
                    </button>
                )}
            </div>

            {/* Filters */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200/80 flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                        type="text"
                        placeholder="Search by patient, doctor, or APT code..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500"
                    />
                </div>
                <div className="flex items-center space-x-2">
                    <Filter className="w-4 h-4 text-slate-400" />
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="text-sm bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-700 focus:ring-2 focus:ring-teal-500"
                    >
                        <option value="">All Statuses</option>
                        <option value="SCHEDULED">Scheduled</option>
                        <option value="COMPLETED">Completed</option>
                        <option value="CANCELLED">Cancelled</option>
                    </select>
                </div>
            </div>

            {/* Appointments Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filtered.map((apt) => (
                    <div
                        key={apt.id}
                        className="bg-white rounded-xl p-5 border border-slate-200/90 shadow-sm hover:shadow-md transition flex flex-col justify-between"
                    >
                        <div>
                            <div className="flex items-center justify-between mb-3">
                                <span className="font-mono text-xs font-bold text-teal-600 bg-teal-50 px-2 py-0.5 rounded">
                                    {apt.appointment_code}
                                </span>
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${apt.status === 'COMPLETED'
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : apt.status === 'CANCELLED'
                                        ? 'bg-rose-100 text-rose-800'
                                        : 'bg-amber-100 text-amber-800'
                                    }`}>
                                    {apt.status}
                                </span>
                            </div>

                            <h3 className="font-bold text-slate-800 text-base">{apt.patient_name}</h3>
                            <p className="text-xs text-slate-400 font-mono mb-3">{apt.patient_code}</p>

                            <div className="space-y-1.5 text-xs text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-100">
                                <div className="flex items-center space-x-2">
                                    <User className="w-3.5 h-3.5 text-teal-600" />
                                    <span className="font-semibold text-slate-800">{apt.doctor_name}</span>
                                    <span className="text-[10px] text-slate-400">({apt.department_name})</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <CalendarIcon className="w-3.5 h-3.5 text-slate-400" />
                                    <span>{apt.appointment_date ? new Date(apt.appointment_date).toLocaleDateString() : 'Today'}</span>
                                    <Clock className="w-3.5 h-3.5 text-slate-400 ml-2" />
                                    <span className="font-medium text-slate-700">{apt.time_slot}</span>
                                </div>
                                <p className="text-slate-500 italic mt-1 pt-1 border-t border-slate-200/60">
                                    "{apt.reason || 'Consultation'}"
                                </p>
                            </div>
                        </div>

                        {/* Action buttons */}
                        {apt.status === 'SCHEDULED' && (
                            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-end space-x-2">
                                <button
                                    onClick={() => handleStatusUpdate(apt.id, 'COMPLETED')}
                                    className="inline-flex items-center space-x-1 text-xs font-semibold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 px-2.5 py-1.5 rounded-lg transition"
                                >
                                    <CheckCircle2 className="w-3.5 h-3.5" />
                                    <span>Complete</span>
                                </button>
                                <button
                                    onClick={() => handleStatusUpdate(apt.id, 'CANCELLED')}
                                    className="inline-flex items-center space-x-1 text-xs font-semibold bg-rose-50 text-rose-700 hover:bg-rose-100 px-2.5 py-1.5 rounded-lg transition"
                                >
                                    <XCircle className="w-3.5 h-3.5" />
                                    <span>Cancel</span>
                                </button>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* Booking Modal */}
            {isBookingOpen && (
                <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 border border-slate-200">
                        <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
                            <h3 className="text-lg font-bold text-slate-800">Book New Appointment</h3>
                            <button onClick={() => setIsBookingOpen(false)} className="text-slate-400 hover:text-slate-600">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <form onSubmit={handleBookAppointment} className="space-y-4">
                            <div>
                                <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">Select Patient *</label>
                                <select
                                    value={formData.patient_id}
                                    onChange={(e) => setFormData({ ...formData, patient_id: e.target.value })}
                                    className="w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-teal-500"
                                >
                                    {patients.map(p => (
                                        <option key={p.id} value={p.id}>{p.full_name} ({p.patient_code})</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">Select Doctor *</label>
                                <select
                                    value={formData.doctor_id}
                                    onChange={(e) => setFormData({ ...formData, doctor_id: e.target.value })}
                                    className="w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-teal-500"
                                >
                                    {doctors.map(d => (
                                        <option key={d.id} value={d.id}>{d.full_name} - {d.department_name}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">Date *</label>
                                    <input
                                        type="date"
                                        required
                                        value={formData.appointment_date}
                                        onChange={(e) => setFormData({ ...formData, appointment_date: e.target.value })}
                                        className="w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-teal-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">Time Slot *</label>
                                    <select
                                        value={formData.time_slot}
                                        onChange={(e) => setFormData({ ...formData, time_slot: e.target.value })}
                                        className="w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-teal-500"
                                    >
                                        {TIME_SLOTS.map(slot => (
                                            <option key={slot} value={slot}>{slot}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">Reason / Chief Complaint</label>
                                <textarea
                                    rows="2"
                                    value={formData.reason}
                                    onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                                    className="w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-teal-500"
                                    placeholder="e.g. Chest discomfort, annual review"
                                />
                            </div>
                            <div className="pt-2 flex justify-end space-x-3">
                                <button
                                    type="button"
                                    onClick={() => setIsBookingOpen(false)}
                                    className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-5 py-2 text-sm bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-lg shadow-sm"
                                >
                                    Confirm Booking
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
