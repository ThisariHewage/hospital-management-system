import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { Users, Search, Plus, Filter, Phone, Mail, Heart, Calendar, FileText, X } from 'lucide-react';

const INITIAL_PATIENTS = [
    { id: 1, patient_code: 'PAT-2026-0001', full_name: 'James Wilson', dob: '1985-04-12', gender: 'Male', phone: '+1 555-1001', email: 'jwilson@email.com', blood_group: 'O+', emergency_contact: 'Mary Wilson (+1 555-1002)' },
    { id: 2, patient_code: 'PAT-2026-0002', full_name: 'Eleanor Rigby', dob: '1992-09-25', gender: 'Female', phone: '+1 555-1003', email: 'erigby@email.com', blood_group: 'A+', emergency_contact: 'John Rigby (+1 555-1004)' },
    { id: 3, patient_code: 'PAT-2026-0003', full_name: 'Liam Vance', dob: '2015-02-18', gender: 'Male', phone: '+1 555-1005', email: 'lvance@email.com', blood_group: 'B-', emergency_contact: 'Grace Vance (+1 555-1006)' },
    { id: 4, patient_code: 'PAT-2026-0004', full_name: 'Sophia Martinez', dob: '1978-11-03', gender: 'Female', phone: '+1 555-1007', email: 'smartinez@email.com', blood_group: 'AB+', emergency_contact: 'Carlos Martinez (+1 555-1008)' }
];

export default function Patients() {
    const [patients, setPatients] = useState(INITIAL_PATIENTS);
    const [search, setSearch] = useState('');
    const [bloodGroup, setBloodGroup] = useState('');
    const [isRegisterOpen, setIsRegisterOpen] = useState(false);
    const [selectedPatient, setSelectedPatient] = useState(null);
    const [loading, setLoading] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        full_name: '',
        dob: '',
        gender: 'Male',
        phone: '',
        email: '',
        address: '',
        blood_group: 'O+',
        emergency_contact: ''
    });

    const fetchPatients = async () => {
        try {
            const res = await api.get('/patients');
            if (res.data?.patients?.length > 0) {
                setPatients(res.data.patients);
            }
        } catch (e) {
            console.log('Using local patient state fallback');
        }
    };

    useEffect(() => {
        fetchPatients();
    }, []);

    const handleRegister = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await api.post('/patients', formData);
            if (res.data?.success) {
                fetchPatients();
            } else {
                // local fallback add
                const newP = {
                    id: Date.now(),
                    patient_code: `PAT-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
                    ...formData
                };
                setPatients([newP, ...patients]);
            }
        } catch (err) {
            const newP = {
                id: Date.now(),
                patient_code: `PAT-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
                ...formData
            };
            setPatients([newP, ...patients]);
        } finally {
            setLoading(false);
            setIsRegisterOpen(false);
            setFormData({
                full_name: '', dob: '', gender: 'Male', phone: '',
                email: '', address: '', blood_group: 'O+', emergency_contact: ''
            });
        }
    };

    const filteredPatients = patients.filter(p => {
        const matchesSearch =
            p.full_name?.toLowerCase().includes(search.toLowerCase()) ||
            p.patient_code?.toLowerCase().includes(search.toLowerCase()) ||
            p.phone?.includes(search);
        const matchesBlood = bloodGroup ? p.blood_group === bloodGroup : true;
        return matchesSearch && matchesBlood;
    });

    return (
        <div className="space-y-6">
            {/* Header & Actions */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Patient Directory</h1>
                    <p className="text-sm text-slate-500">Manage electronic patient profiles, clinical history and admissions</p>
                </div>
                <button
                    onClick={() => setIsRegisterOpen(true)}
                    className="inline-flex items-center space-x-2 bg-gradient-to-r from-teal-600 to-teal-500 hover:from-teal-700 hover:to-teal-600 text-white font-medium px-4 py-2.5 rounded-lg shadow-md shadow-teal-500/20 text-sm transition"
                >
                    <Plus className="w-4 h-4" />
                    <span>Register New Patient</span>
                </button>
            </div>

            {/* Search & Filters */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200/80 flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                        type="text"
                        placeholder="Search by name, patient code (e.g. PAT-2026), or phone..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                </div>
                <div className="flex items-center space-x-2">
                    <Filter className="w-4 h-4 text-slate-400" />
                    <select
                        value={bloodGroup}
                        onChange={(e) => setBloodGroup(e.target.value)}
                        className="text-sm bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500"
                    >
                        <option value="">All Blood Groups</option>
                        <option value="A+">A+</option>
                        <option value="A-">A-</option>
                        <option value="B+">B+</option>
                        <option value="B-">B-</option>
                        <option value="AB+">AB+</option>
                        <option value="AB-">AB-</option>
                        <option value="O+">O+</option>
                        <option value="O-">O-</option>
                    </select>
                </div>
            </div>

            {/* Patients Table */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200/80 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-slate-600">
                        <thead className="bg-slate-50 border-b border-slate-200 text-xs font-semibold uppercase text-slate-500 tracking-wider">
                            <tr>
                                <th className="px-5 py-3.5">Patient Code</th>
                                <th className="px-5 py-3.5">Full Name</th>
                                <th className="px-5 py-3.5">Gender / DOB</th>
                                <th className="px-5 py-3.5">Blood Group</th>
                                <th className="px-5 py-3.5">Contact</th>
                                <th className="px-5 py-3.5 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filteredPatients.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="px-5 py-8 text-center text-slate-400">
                                        No matching patients found.
                                    </td>
                                </tr>
                            ) : (
                                filteredPatients.map((p) => (
                                    <tr key={p.id} className="hover:bg-slate-50/70 transition">
                                        <td className="px-5 py-4 font-mono font-medium text-teal-700">
                                            {p.patient_code}
                                        </td>
                                        <td className="px-5 py-4 font-semibold text-slate-800">
                                            {p.full_name}
                                        </td>
                                        <td className="px-5 py-4">
                                            <span className="text-slate-700 font-medium">{p.gender}</span>
                                            <span className="text-xs text-slate-400 block">{p.dob ? new Date(p.dob).toLocaleDateString() : 'N/A'}</span>
                                        </td>
                                        <td className="px-5 py-4">
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
                                                <Heart className="w-3 h-3 mr-1 text-rose-500" />
                                                {p.blood_group || 'Unknown'}
                                            </span>
                                        </td>
                                        <td className="px-5 py-4 text-xs">
                                            <div className="flex items-center space-x-1 text-slate-700">
                                                <Phone className="w-3.5 h-3.5 text-slate-400" />
                                                <span>{p.phone}</span>
                                            </div>
                                            {p.email && (
                                                <div className="flex items-center space-x-1 text-slate-400 mt-0.5">
                                                    <Mail className="w-3.5 h-3.5" />
                                                    <span>{p.email}</span>
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-5 py-4 text-right">
                                            <button
                                                onClick={() => setSelectedPatient(p)}
                                                className="text-xs font-semibold text-teal-600 hover:text-teal-800 bg-teal-50 hover:bg-teal-100 px-3 py-1.5 rounded-lg transition"
                                            >
                                                View Profile
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Registration Modal */}
            {isRegisterOpen && (
                <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 border border-slate-200 max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
                            <h3 className="text-lg font-bold text-slate-800">Register New Patient</h3>
                            <button onClick={() => setIsRegisterOpen(false)} className="text-slate-400 hover:text-slate-600">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <form onSubmit={handleRegister} className="space-y-4">
                            <div>
                                <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">Full Name *</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.full_name}
                                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                                    className="w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-teal-500"
                                    placeholder="e.g. Johnathan Doe"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">Date of Birth</label>
                                    <input
                                        type="date"
                                        value={formData.dob}
                                        onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                                        className="w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-teal-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">Gender *</label>
                                    <select
                                        value={formData.gender}
                                        onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                                        className="w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-teal-500"
                                    >
                                        <option value="Male">Male</option>
                                        <option value="Female">Female</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">Phone *</label>
                                    <input
                                        type="tel"
                                        required
                                        value={formData.phone}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                        className="w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-teal-500"
                                        placeholder="+1 555-0000"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">Blood Group</label>
                                    <select
                                        value={formData.blood_group}
                                        onChange={(e) => setFormData({ ...formData, blood_group: e.target.value })}
                                        className="w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-teal-500"
                                    >
                                        <option value="A+">A+</option>
                                        <option value="A-">A-</option>
                                        <option value="B+">B+</option>
                                        <option value="B-">B-</option>
                                        <option value="AB+">AB+</option>
                                        <option value="AB-">AB-</option>
                                        <option value="O+">O+</option>
                                        <option value="O-">O-</option>
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">Email Address</label>
                                <input
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    className="w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-teal-500"
                                    placeholder="john@example.com"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">Residential Address</label>
                                <input
                                    type="text"
                                    value={formData.address}
                                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                    className="w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-teal-500"
                                    placeholder="Street, City, Country"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">Emergency Contact</label>
                                <input
                                    type="text"
                                    value={formData.emergency_contact}
                                    onChange={(e) => setFormData({ ...formData, emergency_contact: e.target.value })}
                                    className="w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-teal-500"
                                    placeholder="Name & Relationship (+1 555-xxxx)"
                                />
                            </div>
                            <div className="pt-3 flex justify-end space-x-3">
                                <button
                                    type="button"
                                    onClick={() => setIsRegisterOpen(false)}
                                    className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="px-5 py-2 text-sm bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-lg shadow-sm"
                                >
                                    {loading ? 'Registering...' : 'Save Patient'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Patient Detail Profile Modal */}
            {selectedPatient && (
                <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 border border-slate-200">
                        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                            <div>
                                <span className="text-xs font-mono font-bold text-teal-600">{selectedPatient.patient_code}</span>
                                <h3 className="text-xl font-bold text-slate-800">{selectedPatient.full_name}</h3>
                            </div>
                            <button onClick={() => setSelectedPatient(null)} className="text-slate-400 hover:text-slate-600">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="mt-4 space-y-3 text-sm">
                            <div className="grid grid-cols-2 gap-2 bg-slate-50 p-3 rounded-xl border border-slate-100">
                                <div><span className="text-xs text-slate-400 block">Blood Group:</span> <strong className="text-rose-600">{selectedPatient.blood_group}</strong></div>
                                <div><span className="text-xs text-slate-400 block">Gender:</span> <strong>{selectedPatient.gender}</strong></div>
                                <div><span className="text-xs text-slate-400 block">Date of Birth:</span> <strong>{selectedPatient.dob || 'Not recorded'}</strong></div>
                                <div><span className="text-xs text-slate-400 block">Phone:</span> <strong>{selectedPatient.phone}</strong></div>
                            </div>
                            <div>
                                <span className="text-xs text-slate-400 block">Emergency Contact:</span>
                                <p className="text-slate-700 font-medium">{selectedPatient.emergency_contact || 'None specified'}</p>
                            </div>
                            <div>
                                <span className="text-xs text-slate-400 block">Address:</span>
                                <p className="text-slate-700">{selectedPatient.address || '742 Evergreen Terrace, Springfield'}</p>
                            </div>
                        </div>
                        <div className="mt-6 pt-4 border-t border-slate-100 flex justify-end">
                            <button
                                onClick={() => setSelectedPatient(null)}
                                className="px-4 py-2 bg-slate-800 text-white text-xs font-semibold rounded-lg"
                            >
                                Close Profile
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
