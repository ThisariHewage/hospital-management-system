import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { Pill, AlertTriangle, Plus, Search, Filter, CheckCircle2, PackageCheck, X } from 'lucide-react';

const INITIAL_MEDICINES = [
    { id: 1, name: 'Amoxicillin 500mg', generic_name: 'Amoxicillin Trihydrate', category: 'Antibiotics', stock_quantity: 450, min_stock_alert: 50, unit_price: 12.50, batch_number: 'AMX-2026-A', expiry_date: '2027-08-31' },
    { id: 2, name: 'Paracetamol 650mg', generic_name: 'Acetaminophen', category: 'Analgesics', stock_quantity: 8, min_stock_alert: 25, unit_price: 3.20, batch_number: 'PAR-2026-B', expiry_date: '2027-12-15' },
    { id: 3, name: 'Atorvastatin 20mg', generic_name: 'Atorvastatin Calcium', category: 'Cardiovascular', stock_quantity: 120, min_stock_alert: 30, unit_price: 24.00, batch_number: 'ATV-2025-C', expiry_date: '2026-11-20' },
    { id: 4, name: 'Metformin 850mg', generic_name: 'Metformin Hydrochloride', category: 'Antidiabetic', stock_quantity: 5, min_stock_alert: 20, unit_price: 8.75, batch_number: 'MET-2026-A', expiry_date: '2027-04-10' },
    { id: 5, name: 'Azithromycin 250mg', generic_name: 'Azithromycin', category: 'Antibiotics', stock_quantity: 85, min_stock_alert: 20, unit_price: 18.00, batch_number: 'AZT-2026-D', expiry_date: '2027-09-30' },
];

const INITIAL_PRESCRIPTION_QUEUE = [
    { id: 1, rx_code: 'RX-8801', patient_name: 'James Wilson', doctor_name: 'Dr. Robert Smith', medicine_id: 3, medicine_name: 'Atorvastatin 20mg', quantity: 30, dosage: '1 tab daily', status: 'WAITING_DISPENSE' },
    { id: 2, rx_code: 'RX-8802', patient_name: 'Eleanor Rigby', doctor_name: 'Dr. Sarah Jenkins', medicine_id: 1, medicine_name: 'Amoxicillin 500mg', quantity: 14, dosage: '1 cap twice daily', status: 'WAITING_DISPENSE' }
];

export default function Pharmacy() {
    const [medicines, setMedicines] = useState(INITIAL_MEDICINES);
    const [queue, setQueue] = useState(INITIAL_PRESCRIPTION_QUEUE);
    const [search, setSearch] = useState('');
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [dispenseSuccess, setDispenseSuccess] = useState('');

    // Add Form State
    const [form, setForm] = useState({
        name: '', generic_name: '', category: 'Antibiotics',
        stock_quantity: 100, min_stock_alert: 20, unit_price: 10.00,
        batch_number: 'BATCH-2026', expiry_date: '2028-01-01'
    });

    const fetchMedicines = async () => {
        try {
            const res = await api.get('/pharmacy');
            if (res.data?.medicines?.length > 0) setMedicines(res.data.medicines);
        } catch (e) {
            // fallback
        }
    };

    useEffect(() => {
        fetchMedicines();
    }, []);

    const handleDispense = async (rx) => {
        try {
            await api.post(`/pharmacy/${rx.medicine_id}/dispense`, { quantity: rx.quantity });
        } catch (e) {
            // local update
        }

        // Deduct local stock
        setMedicines(medicines.map(m => m.id === rx.medicine_id ? { ...m, stock_quantity: Math.max(0, m.stock_quantity - rx.quantity) } : m));
        // Remove from queue
        setQueue(queue.filter(q => q.id !== rx.id));
        setDispenseSuccess(`Dispensed ${rx.quantity} units of ${rx.medicine_name} to ${rx.patient_name}`);
        setTimeout(() => setDispenseSuccess(''), 4000);
    };

    const handleAddMedicine = async (e) => {
        e.preventDefault();
        try {
            await api.post('/pharmacy', form);
        } catch (e) {
            // local add
        }

        const newMed = { id: Date.now(), ...form };
        setMedicines([...medicines, newMed]);
        setIsAddOpen(false);
    };

    const filteredMeds = medicines.filter(m =>
        m.name.toLowerCase().includes(search.toLowerCase()) ||
        m.generic_name?.toLowerCase().includes(search.toLowerCase()) ||
        m.category?.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Pharmacy & Dispensing Queue</h1>
                    <p className="text-sm text-slate-500">Track medication inventory, stock alerts and electronic prescription fulfillment</p>
                </div>
                <button
                    onClick={() => setIsAddOpen(true)}
                    className="inline-flex items-center space-x-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 text-white font-medium px-4 py-2.5 rounded-lg shadow-md shadow-emerald-500/20 text-sm transition"
                >
                    <Plus className="w-4 h-4" />
                    <span>Add New Medicine</span>
                </button>
            </div>

            {dispenseSuccess && (
                <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-xl text-sm font-semibold flex items-center space-x-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    <span>{dispenseSuccess}</span>
                </div>
            )}

            {/* Prescriptions to Dispense Queue */}
            {queue.length > 0 && (
                <div className="bg-teal-50/70 border border-teal-200 rounded-xl p-5">
                    <h2 className="text-sm font-bold uppercase tracking-wider text-teal-900 mb-3 flex items-center space-x-2">
                        <PackageCheck className="w-4 h-4 text-teal-700" />
                        <span>Prescription Dispensing Queue ({queue.length} Pending)</span>
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {queue.map(q => (
                            <div key={q.id} className="bg-white p-3.5 rounded-lg border border-teal-100 shadow-sm flex items-center justify-between">
                                <div>
                                    <div className="flex items-center space-x-2">
                                        <span className="font-mono text-xs font-bold text-teal-700 bg-teal-50 px-1.5 py-0.5 rounded">{q.rx_code}</span>
                                        <h3 className="font-bold text-slate-800 text-sm">{q.patient_name}</h3>
                                    </div>
                                    <p className="text-xs text-slate-600 mt-1">
                                        Med: <strong>{q.medicine_name}</strong> • Qty: <strong>{q.quantity}</strong> ({q.dosage})
                                    </p>
                                    <p className="text-[11px] text-slate-400">Prescribed by {q.doctor_name}</p>
                                </div>
                                <button
                                    onClick={() => handleDispense(q)}
                                    className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-3 py-2 rounded-lg shadow-sm transition"
                                >
                                    Dispense
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Search and Table */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200/80 overflow-hidden">
                <div className="p-4 border-b border-slate-200 flex items-center">
                    <div className="relative flex-1 max-w-md">
                        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                        <input
                            type="text"
                            placeholder="Search medicines by name, generic, or category..."
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
                                <th className="px-5 py-3.5">Medicine Name</th>
                                <th className="px-5 py-3.5">Category</th>
                                <th className="px-5 py-3.5">Current Stock</th>
                                <th className="px-5 py-3.5">Unit Price</th>
                                <th className="px-5 py-3.5">Batch / Expiry</th>
                                <th className="px-5 py-3.5 text-right">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filteredMeds.map(m => {
                                const isLowStock = m.stock_quantity <= m.min_stock_alert;
                                return (
                                    <tr key={m.id} className="hover:bg-slate-50/70 transition">
                                        <td className="px-5 py-4">
                                            <p className="font-semibold text-slate-800">{m.name}</p>
                                            <p className="text-xs text-slate-400 font-mono">{m.generic_name}</p>
                                        </td>
                                        <td className="px-5 py-4">
                                            <span className="text-xs bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-medium">
                                                {m.category}
                                            </span>
                                        </td>
                                        <td className="px-5 py-4">
                                            <span className={`font-bold ${isLowStock ? 'text-rose-600' : 'text-slate-800'}`}>
                                                {m.stock_quantity} units
                                            </span>
                                            <span className="text-xs text-slate-400 block">Min alert: {m.min_stock_alert}</span>
                                        </td>
                                        <td className="px-5 py-4 font-semibold text-slate-800">
                                            ${Number(m.unit_price).toFixed(2)}
                                        </td>
                                        <td className="px-5 py-4 text-xs">
                                            <span className="font-mono text-slate-700">{m.batch_number}</span>
                                            <span className="block text-slate-400">Exp: {new Date(m.expiry_date).toLocaleDateString()}</span>
                                        </td>
                                        <td className="px-5 py-4 text-right">
                                            {isLowStock ? (
                                                <span className="inline-flex items-center text-xs font-bold text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-full">
                                                    <AlertTriangle className="w-3 h-3 mr-1 text-rose-500" />
                                                    Low Stock
                                                </span>
                                            ) : (
                                                <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                                                    In Stock
                                                </span>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Add Medicine Modal */}
            {isAddOpen && (
                <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 border border-slate-200">
                        <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
                            <h3 className="text-lg font-bold text-slate-800">Add Medicine / Stock</h3>
                            <button onClick={() => setIsAddOpen(false)} className="text-slate-400 hover:text-slate-600">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <form onSubmit={handleAddMedicine} className="space-y-3">
                            <div>
                                <label className="block text-xs font-semibold text-slate-500 mb-1">Brand Name *</label>
                                <input
                                    type="text"
                                    required
                                    value={form.name}
                                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                                    className="w-full text-sm border rounded-lg px-3 py-2"
                                    placeholder="e.g. Lipitor 20mg"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-slate-500 mb-1">Generic Name</label>
                                <input
                                    type="text"
                                    value={form.generic_name}
                                    onChange={(e) => setForm({ ...form, generic_name: e.target.value })}
                                    className="w-full text-sm border rounded-lg px-3 py-2"
                                    placeholder="e.g. Atorvastatin"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-500 mb-1">Stock Quantity</label>
                                    <input
                                        type="number"
                                        value={form.stock_quantity}
                                        onChange={(e) => setForm({ ...form, stock_quantity: Number(e.target.value) })}
                                        className="w-full text-sm border rounded-lg px-3 py-2"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-500 mb-1">Unit Price ($)</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={form.unit_price}
                                        onChange={(e) => setForm({ ...form, unit_price: Number(e.target.value) })}
                                        className="w-full text-sm border rounded-lg px-3 py-2"
                                    />
                                </div>
                            </div>
                            <div className="pt-2 flex justify-end space-x-2">
                                <button type="button" onClick={() => setIsAddOpen(false)} className="px-3 py-1.5 text-xs text-slate-600">
                                    Cancel
                                </button>
                                <button type="submit" className="px-4 py-1.5 text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg shadow-sm">
                                    Save Medicine
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
