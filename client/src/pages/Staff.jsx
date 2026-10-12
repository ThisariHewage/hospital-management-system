import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { UserCheck, Clock, Plus, Search, Filter, CheckCircle2, XCircle, X } from 'lucide-react';

const INITIAL_STAFF = [
    { id: 1, employee_code: 'EMP-101', full_name: 'Dr. Robert Smith', role_title: 'Senior Cardiologist', department_name: 'Cardiology', phone: '+1 555-2001', email: 'smith@medicore.org', salary: 14500.00, status: 'PRESENT' },
    { id: 2, employee_code: 'EMP-102', full_name: 'Dr. Sarah Jenkins', role_title: 'Head of Pediatrics', department_name: 'Pediatrics', phone: '+1 555-2002', email: 'jenkins@medicore.org', salary: 13800.00, status: 'PRESENT' },
    { id: 3, employee_code: 'EMP-103', full_name: 'Nurse Joy Carter', role_title: 'Chief Ward Nurse', department_name: 'Inpatient Care', phone: '+1 555-2003', email: 'joy@medicore.org', salary: 6500.00, status: 'PRESENT' },
    { id: 4, employee_code: 'EMP-104', full_name: 'Alex Rivera', role_title: 'Front Desk Receptionist', department_name: 'Administration', phone: '+1 555-2004', email: 'alex@medicore.org', salary: 4200.00, status: 'PRESENT' },
    { id: 5, employee_code: 'EMP-105', full_name: 'David Chen', role_title: 'Pathology Lab Technician', department_name: 'Laboratory', phone: '+1 555-2005', email: 'david@medicore.org', salary: 5800.00, status: 'PRESENT' },
    { id: 6, employee_code: 'EMP-106', full_name: 'Emma Watson', role_title: 'Lead Pharmacist', department_name: 'Pharmacy', phone: '+1 555-2006', email: 'emma@medicore.org', salary: 7200.00, status: 'PRESENT' },
    { id: 7, employee_code: 'EMP-107', full_name: 'Marcus Brody', role_title: 'Senior Hospital Accountant', department_name: 'Finance', phone: '+1 555-2007', email: 'marcus@medicore.org', salary: 6800.00, status: 'PRESENT' }
];

export default function Staff() {
    const [staff, setStaff] = useState(INITIAL_STAFF);
    const [search, setSearch] = useState('');
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [formData, setFormData] = useState({
        full_name: '', role_title: '', department_name: 'Cardiology',
        phone: '', email: '', salary: 5000.00
    });

    const toggleAttendance = (id) => {
        setStaff(staff.map(s => {
            if (s.id === id) {
                const newStatus = s.status === 'PRESENT' ? 'ABSENT' : 'PRESENT';
                return { ...s, status: newStatus };
            }
            return s;
        }));
    };

    const handleAddStaff = (e) => {
        e.preventDefault();
        const newMember = {
            id: Date.now(),
            employee_code: `EMP-${Math.floor(100 + Math.random() * 900)}`,
            status: 'PRESENT',
            ...formData
        };
        setStaff([...staff, newMember]);
        setIsAddOpen(false);
        setFormData({ full_name: '', role_title: '', department_name: 'Cardiology', phone: '', email: '', salary: 5000.00 });
    };

    const filtered = staff.filter(s =>
        s.full_name.toLowerCase().includes(search.toLowerCase()) ||
        s.role_title.toLowerCase().includes(search.toLowerCase()) ||
        s.department_name.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Staff & Attendance Manager</h1>
                    <p className="text-sm text-slate-500">Manage hospital personnel directory, daily attendance check-in, and payroll status</p>
                </div>
                <button
                    onClick={() => setIsAddOpen(true)}
                    className="inline-flex items-center space-x-2 bg-gradient-to-r from-teal-600 to-teal-500 hover:from-teal-700 text-white font-medium px-4 py-2.5 rounded-lg shadow-md shadow-teal-500/20 text-sm transition"
                >
                    <Plus className="w-4 h-4" />
                    <span>Add New Staff</span>
                </button>
            </div>

            {/* Attendance Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
                    <div>
                        <span className="text-xs text-slate-400 uppercase font-semibold">Total Employees</span>
                        <h3 className="text-2xl font-bold text-slate-800">{staff.length}</h3>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center font-bold">
                        👥
                    </div>
                </div>
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
                    <div>
                        <span className="text-xs text-slate-400 uppercase font-semibold">Present Today</span>
                        <h3 className="text-2xl font-bold text-emerald-600">
                            {staff.filter(s => s.status === 'PRESENT').length}
                        </h3>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                        <CheckCircle2 className="w-5 h-5" />
                    </div>
                </div>
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
                    <div>
                        <span className="text-xs text-slate-400 uppercase font-semibold">Absent / On Leave</span>
                        <h3 className="text-2xl font-bold text-rose-600">
                            {staff.filter(s => s.status === 'ABSENT').length}
                        </h3>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
                        <XCircle className="w-5 h-5" />
                    </div>
                </div>
            </div>

            {/* Staff Table */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200/80 overflow-hidden">
                <div className="p-4 border-b border-slate-200 flex items-center">
                    <div className="relative flex-1 max-w-md">
                        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                        <input
                            type="text"
                            placeholder="Search by staff name, role, or department..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-slate-600">
                        <thead className="bg-slate-50 border-b border-slate-200 text-xs font-semibold uppercase text-slate-500 tracking-wider">
                            <tr>
                                <th className="px-5 py-3.5">Employee Code</th>
                                <th className="px-5 py-3.5">Full Name</th>
                                <th className="px-5 py-3.5">Role / Department</th>
                                <th className="px-5 py-3.5">Contact</th>
                                <th className="px-5 py-3.5">Salary</th>
                                <th className="px-5 py-3.5 text-right">Today's Attendance</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filtered.map(s => (
                                <tr key={s.id} className="hover:bg-slate-50/70 transition">
                                    <td className="px-5 py-4 font-mono font-medium text-teal-700">
                                        {s.employee_code}
                                    </td>
                                    <td className="px-5 py-4 font-semibold text-slate-800">
                                        {s.full_name}
                                    </td>
                                    <td className="px-5 py-4">
                                        <p className="font-medium text-slate-800">{s.role_title}</p>
                                        <p className="text-xs text-slate-400">{s.department_name}</p>
                                    </td>
                                    <td className="px-5 py-4 text-xs">
                                        <span className="block text-slate-700">{s.phone}</span>
                                        <span className="text-slate-400">{s.email}</span>
                                    </td>
                                    <td className="px-5 py-4 font-semibold text-slate-800">
                                        ${Number(s.salary).toLocaleString()}/mo
                                    </td>
                                    <td className="px-5 py-4 text-right">
                                        <button
                                            onClick={() => toggleAttendance(s.id)}
                                            className={`inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${s.status === 'PRESENT'
                                                    ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
                                                    : 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200'
                                                }`}
                                        >
                                            {s.status === 'PRESENT' ? (
                                                <>
                                                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                                    <span>Present</span>
                                                </>
                                            ) : (
                                                <>
                                                    <XCircle className="w-3.5 h-3.5 text-rose-600" />
                                                    <span>Absent</span>
                                                </>
                                            )}
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Add Staff Modal */}
            {isAddOpen && (
                <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 border border-slate-200">
                        <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
                            <h3 className="text-lg font-bold text-slate-800">Add Staff Member</h3>
                            <button onClick={() => setIsAddOpen(false)} className="text-slate-400 hover:text-slate-600">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <form onSubmit={handleAddStaff} className="space-y-3">
                            <div>
                                <label className="block text-xs font-semibold text-slate-500 mb-1">Full Name *</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.full_name}
                                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                                    className="w-full text-sm border rounded-lg px-3 py-2"
                                    placeholder="e.g. Dr. Arthur Conan"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-500 mb-1">Role Title</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.role_title}
                                        onChange={(e) => setFormData({ ...formData, role_title: e.target.value })}
                                        className="w-full text-sm border rounded-lg px-3 py-2"
                                        placeholder="e.g. Neurologist"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-500 mb-1">Department</label>
                                    <select
                                        value={formData.department_name}
                                        onChange={(e) => setFormData({ ...formData, department_name: e.target.value })}
                                        className="w-full text-sm border rounded-lg px-3 py-2"
                                    >
                                        <option value="Cardiology">Cardiology</option>
                                        <option value="Pediatrics">Pediatrics</option>
                                        <option value="Orthopedics">Orthopedics</option>
                                        <option value="Laboratory">Laboratory</option>
                                        <option value="Pharmacy">Pharmacy</option>
                                        <option value="Finance">Finance</option>
                                    </select>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-500 mb-1">Phone</label>
                                    <input
                                        type="text"
                                        value={formData.phone}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                        className="w-full text-sm border rounded-lg px-3 py-2"
                                        placeholder="+1 555-xxxx"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-500 mb-1">Salary ($/mo)</label>
                                    <input
                                        type="number"
                                        value={formData.salary}
                                        onChange={(e) => setFormData({ ...formData, salary: Number(e.target.value) })}
                                        className="w-full text-sm border rounded-lg px-3 py-2"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-slate-500 mb-1">Email</label>
                                <input
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    className="w-full text-sm border rounded-lg px-3 py-2"
                                    placeholder="doctor@medicore.org"
                                />
                            </div>
                            <div className="pt-2 flex justify-end space-x-2">
                                <button type="button" onClick={() => setIsAddOpen(false)} className="px-3 py-1.5 text-xs text-slate-600">
                                    Cancel
                                </button>
                                <button type="submit" className="px-4 py-1.5 text-xs bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-lg shadow-sm">
                                    Save Staff Member
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
