import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import { Plus, Edit3, Stethoscope, X } from 'lucide-react';

const EMPTY = { full_name: '', department_id: '', specialization: '', phone: '', consultation_fee: '50', schedule_days: 'Mon,Tue,Wed,Thu,Fri', schedule_time: '09:00 - 17:00' };

export default function Doctors() {
    const [doctors, setDoctors] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [form, setForm] = useState(EMPTY);
    const [editing, setEditing] = useState(null);
    const [open, setOpen] = useState(false);
    const [saving, setSaving] = useState(false);

    const load = async () => {
        try {
            const [doctorRes, departmentRes] = await Promise.all([api.get('/doctors'), api.get('/departments')]);
            setDoctors(doctorRes.data?.doctors || []);
            setDepartments(departmentRes.data?.departments || []);
        } catch (error) { alert(error.response?.data?.message || 'Unable to load doctor records.'); }
    };
    useEffect(() => { load(); }, []);
    const change = e => setForm({ ...form, [e.target.name]: e.target.value });
    const submit = async e => {
        e.preventDefault(); setSaving(true);
        try {
            if (editing) await api.patch(`/doctors/${editing}`, form);
            else await api.post('/doctors', form);
            await load(); setOpen(false); setEditing(null); setForm(EMPTY);
        } catch (error) { alert(error.response?.data?.message || 'Unable to save doctor.'); }
        finally { setSaving(false); }
    };
    const edit = doctor => { setEditing(doctor.id); setForm({ ...doctor, department_id: String(doctor.department_id), consultation_fee: String(doctor.consultation_fee) }); setOpen(true); };
    return <div className="space-y-6">
        <div className="flex justify-between items-center gap-4"><div><h1 className="text-2xl font-bold text-slate-800">Doctor Management</h1><p className="text-sm text-slate-500">Manage physician details, department assignments, fees, and availability.</p></div><button onClick={() => { setEditing(null); setForm(EMPTY); setOpen(true); }} className="inline-flex items-center gap-2 bg-teal-600 text-white px-4 py-2.5 rounded-lg text-sm font-semibold"><Plus className="w-4 h-4" /> Add Doctor</button></div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">{doctors.map(d => <div key={d.id} className="bg-white border rounded-xl p-5 shadow-sm"><div className="flex justify-between gap-2"><div><h2 className="font-bold text-slate-800">{d.full_name}</h2><p className="text-xs text-teal-700">{d.specialization}</p></div><Stethoscope className="w-5 h-5 text-teal-600" /></div><div className="mt-4 text-xs space-y-1.5 text-slate-600"><p><b>Department:</b> {d.department_name}</p><p><b>Phone:</b> {d.phone}</p><p><b>Consultation:</b> ${Number(d.consultation_fee).toFixed(2)}</p><p><b>Days:</b> {d.schedule_days}</p><p><b>Hours:</b> {d.schedule_time}</p></div><button onClick={() => edit(d)} className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-teal-700 bg-teal-50 px-3 py-1.5 rounded-lg"><Edit3 className="w-3.5 h-3.5" /> Edit Details & Schedule</button></div>)}</div>
        {open && <div className="fixed inset-0 z-50 bg-slate-900/60 flex justify-center items-center p-4"><div className="bg-white rounded-2xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto"><div className="flex justify-between border-b pb-3 mb-4"><h2 className="font-bold">{editing ? 'Edit Doctor' : 'Add Doctor'}</h2><button onClick={() => setOpen(false)}><X /></button></div><form onSubmit={submit} className="space-y-3"><input name="full_name" required value={form.full_name} onChange={change} placeholder="Doctor full name" className="w-full border rounded-lg px-3 py-2 text-sm" /><select name="department_id" required value={form.department_id} onChange={change} className="w-full border rounded-lg px-3 py-2 text-sm"><option value="">Select department</option>{departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}</select><input name="specialization" required value={form.specialization} onChange={change} placeholder="Specialization" className="w-full border rounded-lg px-3 py-2 text-sm" /><input name="phone" required value={form.phone} onChange={change} placeholder="Phone" className="w-full border rounded-lg px-3 py-2 text-sm" /><div className="grid grid-cols-2 gap-3"><input name="consultation_fee" required min="0" type="number" step="0.01" value={form.consultation_fee} onChange={change} placeholder="Consultation fee" className="border rounded-lg px-3 py-2 text-sm" /><input name="schedule_days" required value={form.schedule_days} onChange={change} placeholder="Mon,Tue,Wed" className="border rounded-lg px-3 py-2 text-sm" /></div><input name="schedule_time" required value={form.schedule_time} onChange={change} placeholder="09:00 - 17:00" className="w-full border rounded-lg px-3 py-2 text-sm" /><button disabled={saving} className="w-full bg-teal-600 text-white py-2 rounded-lg text-sm font-semibold">{saving ? 'Saving...' : 'Save Doctor'}</button></form></div></div>}
    </div>;
}
