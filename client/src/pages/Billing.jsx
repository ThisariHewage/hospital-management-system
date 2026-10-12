import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { Receipt, Printer, CreditCard, Plus, Search, Filter, CheckCircle2, FileText, X } from 'lucide-react';

const INITIAL_BILLS = [
    {
        id: 1,
        invoice_number: 'INV-2026-1001',
        patient_id: 1,
        patient_name: 'James Wilson',
        patient_code: 'PAT-2026-0001',
        patient_phone: '+1 555-1001',
        subtotal: 125.00,
        discount: 10.00,
        tax_rate: 5.0,
        total_amount: 120.75,
        paid_amount: 120.75,
        status: 'PAID',
        created_at: '2026-10-12',
        items: [
            { id: 1, description: 'Cardiology Specialist Consultation', item_type: 'CONSULTATION', quantity: 1, unit_price: 75.00, total_price: 75.00 },
            { id: 2, description: 'Lipid Profile Comprehensive Lab', item_type: 'LAB_TEST', quantity: 1, unit_price: 50.00, total_price: 50.00 }
        ]
    },
    {
        id: 2,
        invoice_number: 'INV-2026-1002',
        patient_id: 2,
        patient_name: 'Eleanor Rigby',
        patient_code: 'PAT-2026-0002',
        patient_phone: '+1 555-1003',
        subtotal: 150.00,
        discount: 0.00,
        tax_rate: 5.0,
        total_amount: 157.50,
        paid_amount: 50.00,
        status: 'PARTIAL',
        created_at: '2026-10-12',
        items: [
            { id: 1, description: 'Neurology Consultation', item_type: 'CONSULTATION', quantity: 1, unit_price: 80.00, total_price: 80.00 },
            { id: 2, description: 'Complete Blood Count (CBC)', item_type: 'LAB_TEST', quantity: 1, unit_price: 45.00, total_price: 45.00 },
            { id: 3, description: 'Amoxicillin 500mg (14 caps)', item_type: 'PHARMACY', quantity: 1, unit_price: 25.00, total_price: 25.00 }
        ]
    },
    {
        id: 3,
        invoice_number: 'INV-2026-1003',
        patient_id: 4,
        patient_name: 'Sophia Martinez',
        patient_code: 'PAT-2026-0004',
        patient_phone: '+1 555-1007',
        subtotal: 210.00,
        discount: 15.00,
        tax_rate: 5.0,
        total_amount: 204.75,
        paid_amount: 0.00,
        status: 'UNPAID',
        created_at: '2026-10-11',
        items: [
            { id: 1, description: 'Orthopedic Consultation & Knee Bracing', item_type: 'CONSULTATION', quantity: 1, unit_price: 150.00, total_price: 150.00 },
            { id: 2, description: 'X-Ray Knee Bilateral', item_type: 'RADIOLOGY', quantity: 1, unit_price: 60.00, total_price: 60.00 }
        ]
    }
];

export default function Billing() {
    const [bills, setBills] = useState(INITIAL_BILLS);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [selectedBillForPrint, setSelectedBillForPrint] = useState(null);
    const [isPaymentOpen, setIsPaymentOpen] = useState(false);
    const [selectedBillForPay, setSelectedBillForPay] = useState(null);
    const [paymentAmount, setPaymentAmount] = useState('');
    const [paymentMethod, setPaymentMethod] = useState('CARD');

    const fetchBills = async () => {
        try {
            const res = await api.get('/billing');
            if (res.data?.bills?.length > 0) setBills(res.data.bills);
        } catch (e) {
            // fallback
        }
    };

    useEffect(() => {
        fetchBills();
    }, []);

    const handleOpenPayment = (bill) => {
        setSelectedBillForPay(bill);
        const remaining = Number(bill.total_amount) - Number(bill.paid_amount);
        setPaymentAmount(remaining.toFixed(2));
        setIsPaymentOpen(true);
    };

    const handleRecordPayment = async (e) => {
        e.preventDefault();
        const amt = parseFloat(paymentAmount);
        if (!selectedBillForPay || isNaN(amt) || amt <= 0) return;

        try {
            await api.post(`/billing/${selectedBillForPay.id}/pay`, {
                amount: amt,
                payment_method: paymentMethod
            });
        } catch (e) {
            // offline mode
        }

        const updated = bills.map(b => {
            if (b.id === selectedBillForPay.id) {
                const newPaid = Number(b.paid_amount) + amt;
                const newStatus = newPaid >= Number(b.total_amount) ? 'PAID' : 'PARTIAL';
                return { ...b, paid_amount: newPaid, status: newStatus };
            }
            return b;
        });

        setBills(updated);
        setIsPaymentOpen(false);
    };

    const handlePrintInvoice = () => {
        window.print();
    };

    const filtered = bills.filter(b => {
        const matchesSearch = b.invoice_number?.toLowerCase().includes(search.toLowerCase()) ||
            b.patient_name?.toLowerCase().includes(search.toLowerCase());
        const matchesStatus = statusFilter ? b.status === statusFilter : true;
        return matchesSearch && matchesStatus;
    });

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Billing & Invoicing Desk</h1>
                    <p className="text-sm text-slate-500">Manage patient invoices, cashier receipts, and insurance settlement records</p>
                </div>
            </div>

            {/* Filter toolbar */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200/80 flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                        type="text"
                        placeholder="Search by invoice number (e.g. INV-2026-1001) or patient..."
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
                        <option value="">All Payment Statuses</option>
                        <option value="PAID">Paid</option>
                        <option value="PARTIAL">Partial</option>
                        <option value="UNPAID">Unpaid</option>
                    </select>
                </div>
            </div>

            {/* Invoices Table */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200/80 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-slate-600">
                        <thead className="bg-slate-50 border-b border-slate-200 text-xs font-semibold uppercase text-slate-500 tracking-wider">
                            <tr>
                                <th className="px-5 py-3.5">Invoice #</th>
                                <th className="px-5 py-3.5">Patient</th>
                                <th className="px-5 py-3.5">Date</th>
                                <th className="px-5 py-3.5">Total Amount</th>
                                <th className="px-5 py-3.5">Paid / Due</th>
                                <th className="px-5 py-3.5">Status</th>
                                <th className="px-5 py-3.5 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filtered.map((b) => {
                                const due = Math.max(0, Number(b.total_amount) - Number(b.paid_amount));
                                return (
                                    <tr key={b.id} className="hover:bg-slate-50/70 transition">
                                        <td className="px-5 py-4 font-mono font-medium text-teal-700">
                                            {b.invoice_number}
                                        </td>
                                        <td className="px-5 py-4">
                                            <p className="font-semibold text-slate-800">{b.patient_name}</p>
                                            <p className="text-xs text-slate-400 font-mono">{b.patient_code}</p>
                                        </td>
                                        <td className="px-5 py-4 text-xs text-slate-600">
                                            {b.created_at ? new Date(b.created_at).toLocaleDateString() : 'Today'}
                                        </td>
                                        <td className="px-5 py-4 font-bold text-slate-800">
                                            ${Number(b.total_amount).toFixed(2)}
                                        </td>
                                        <td className="px-5 py-4 text-xs">
                                            <span className="text-emerald-700 font-medium">${Number(b.paid_amount).toFixed(2)} paid</span>
                                            {due > 0 && <span className="block text-rose-600 font-bold">${due.toFixed(2)} due</span>}
                                        </td>
                                        <td className="px-5 py-4">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${b.status === 'PAID'
                                                    ? 'bg-emerald-100 text-emerald-800'
                                                    : b.status === 'PARTIAL'
                                                        ? 'bg-amber-100 text-amber-800'
                                                        : 'bg-rose-100 text-rose-800'
                                                }`}>
                                                {b.status}
                                            </span>
                                        </td>
                                        <td className="px-5 py-4 text-right space-x-2">
                                            {b.status !== 'PAID' && (
                                                <button
                                                    onClick={() => handleOpenPayment(b)}
                                                    className="inline-flex items-center space-x-1 text-xs font-semibold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 px-2.5 py-1.5 rounded-lg transition"
                                                >
                                                    <CreditCard className="w-3.5 h-3.5" />
                                                    <span>Pay</span>
                                                </button>
                                            )}
                                            <button
                                                onClick={() => setSelectedBillForPrint(b)}
                                                className="inline-flex items-center space-x-1 text-xs font-semibold bg-teal-50 text-teal-700 hover:bg-teal-100 px-2.5 py-1.5 rounded-lg transition"
                                            >
                                                <Printer className="w-3.5 h-3.5" />
                                                <span>Print Invoice</span>
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Record Payment Modal */}
            {isPaymentOpen && selectedBillForPay && (
                <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 border border-slate-200">
                        <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
                            <h3 className="text-base font-bold text-slate-800">Record Payment</h3>
                            <button onClick={() => setIsPaymentOpen(false)} className="text-slate-400 hover:text-slate-600">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <form onSubmit={handleRecordPayment} className="space-y-3">
                            <div className="bg-slate-50 p-3 rounded-lg text-xs space-y-1">
                                <p><strong>Invoice:</strong> {selectedBillForPay.invoice_number}</p>
                                <p><strong>Patient:</strong> {selectedBillForPay.patient_name}</p>
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-slate-500 mb-1">Payment Amount ($)</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    required
                                    value={paymentAmount}
                                    onChange={(e) => setPaymentAmount(e.target.value)}
                                    className="w-full text-base font-bold text-teal-700 border rounded-lg px-3 py-2"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-slate-500 mb-1">Payment Method</label>
                                <select
                                    value={paymentMethod}
                                    onChange={(e) => setPaymentMethod(e.target.value)}
                                    className="w-full text-sm border rounded-lg px-3 py-2"
                                >
                                    <option value="CARD">Credit / Debit Card</option>
                                    <option value="CASH">Cash</option>
                                    <option value="INSURANCE">Health Insurance</option>
                                    <option value="BANK_TRANSFER">Bank Transfer</option>
                                </select>
                            </div>
                            <div className="pt-2 flex justify-end space-x-2">
                                <button type="button" onClick={() => setIsPaymentOpen(false)} className="px-3 py-1.5 text-xs text-slate-600">
                                    Cancel
                                </button>
                                <button type="submit" className="px-4 py-1.5 text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg shadow-sm">
                                    Confirm Payment
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Printable Medical Invoice / Receipt Modal */}
            {selectedBillForPrint && (
                <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 print:p-0">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-8 border border-slate-200 print:border-none print:shadow-none print:w-full print:max-w-full">
                        {/* Print Header */}
                        <div className="flex items-start justify-between border-b pb-6 border-slate-200">
                            <div>
                                <div className="flex items-center space-x-3">
                                    <span className="text-3xl">🏥</span>
                                    <div>
                                        <h2 className="text-2xl font-black text-slate-900 tracking-tight">MediCore Hospital</h2>
                                        <p className="text-xs text-slate-500">Excellence in Healthcare & Clinical Services</p>
                                    </div>
                                </div>
                                <p className="text-xs text-slate-400 mt-2">100 Health Sciences Way, Metro City • Tel: +1 (800) 555-CORE</p>
                            </div>
                            <div className="text-right">
                                <span className="font-mono text-xs font-bold text-teal-700 bg-teal-50 px-2 py-1 rounded">
                                    {selectedBillForPrint.invoice_number}
                                </span>
                                <p className="text-xs text-slate-500 mt-1">Date: {new Date(selectedBillForPrint.created_at).toLocaleDateString()}</p>
                                <span className={`inline-block mt-1 text-[10px] font-bold px-2 py-0.5 rounded uppercase ${selectedBillForPrint.status === 'PAID' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                                    }`}>
                                    Status: {selectedBillForPrint.status}
                                </span>
                            </div>
                        </div>

                        {/* Bill To */}
                        <div className="py-4 border-b border-slate-100 text-xs grid grid-cols-2 gap-4">
                            <div>
                                <span className="text-[10px] uppercase font-bold text-slate-400 block">Billed To (Patient)</span>
                                <p className="font-bold text-slate-800 text-sm mt-0.5">{selectedBillForPrint.patient_name}</p>
                                <p className="font-mono text-slate-500">{selectedBillForPrint.patient_code}</p>
                                <p className="text-slate-500">Phone: {selectedBillForPrint.patient_phone || '+1 555-1001'}</p>
                            </div>
                            <div className="text-right">
                                <span className="text-[10px] uppercase font-bold text-slate-400 block">Payment Mode</span>
                                <p className="font-semibold text-slate-700 mt-0.5">Cashier Desk / Settlement</p>
                                <p className="text-slate-400">GST Registration: #MED-99201-HST</p>
                            </div>
                        </div>

                        {/* Itemized Table */}
                        <div className="py-4">
                            <table className="w-full text-xs text-left">
                                <thead className="bg-slate-50 text-slate-500 uppercase border-y border-slate-200">
                                    <tr>
                                        <th className="py-2 px-3">Item Description</th>
                                        <th className="py-2 px-3 text-center">Qty</th>
                                        <th className="py-2 px-3 text-right">Unit Price</th>
                                        <th className="py-2 px-3 text-right">Total</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 text-slate-700">
                                    {(selectedBillForPrint.items || [
                                        { id: 1, description: 'Consultation & Medical Care', quantity: 1, unit_price: selectedBillForPrint.subtotal, total_price: selectedBillForPrint.subtotal }
                                    ]).map((it, idx) => (
                                        <tr key={idx}>
                                            <td className="py-2 px-3 font-medium text-slate-800">{it.description}</td>
                                            <td className="py-2 px-3 text-center">{it.quantity}</td>
                                            <td className="py-2 px-3 text-right">${Number(it.unit_price).toFixed(2)}</td>
                                            <td className="py-2 px-3 text-right font-semibold">${Number(it.total_price).toFixed(2)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Calculation Summary */}
                        <div className="pt-3 border-t border-slate-200 flex justify-end">
                            <div className="w-56 text-xs space-y-1.5 text-slate-600">
                                <div className="flex justify-between">
                                    <span>Subtotal:</span>
                                    <span>${Number(selectedBillForPrint.subtotal).toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-slate-500">
                                    <span>Discount:</span>
                                    <span>-${Number(selectedBillForPrint.discount || 0).toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-slate-500">
                                    <span>Tax ({selectedBillForPrint.tax_rate}%):</span>
                                    <span>+${(((selectedBillForPrint.subtotal - (selectedBillForPrint.discount || 0)) * selectedBillForPrint.tax_rate) / 100).toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between font-bold text-slate-900 pt-1 border-t border-slate-200 text-sm">
                                    <span>Total Due:</span>
                                    <span>${Number(selectedBillForPrint.total_amount).toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-emerald-700 font-semibold">
                                    <span>Paid Amount:</span>
                                    <span>${Number(selectedBillForPrint.paid_amount).toFixed(2)}</span>
                                </div>
                            </div>
                        </div>

                        {/* Footer & Actions */}
                        <div className="mt-8 pt-6 border-t border-slate-100 flex items-center justify-between print:hidden">
                            <p className="text-[11px] text-slate-400">Thank you for choosing MediCore Healthcare.</p>
                            <div className="flex space-x-3">
                                <button
                                    onClick={() => setSelectedBillForPrint(null)}
                                    className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
                                >
                                    Close
                                </button>
                                <button
                                    onClick={handlePrintInvoice}
                                    className="inline-flex items-center space-x-1.5 px-4 py-2 text-xs font-semibold bg-teal-600 hover:bg-teal-700 text-white rounded-lg shadow-sm"
                                >
                                    <Printer className="w-4 h-4" />
                                    <span>Print / Export PDF</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
