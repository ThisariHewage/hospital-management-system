import React, { useState } from 'react';
import { BarChart3, Download, DollarSign, Users, Calendar, Pill, TrendingUp, Filter } from 'lucide-react';

const REVENUE_DATA = [
    { id: 1, date: '2026-10-12', category: 'Consultations', invoices_count: 14, billed: 1250.00, collected: 1100.00 },
    { id: 2, date: '2026-10-12', category: 'Pharmacy Sales', invoices_count: 28, billed: 890.50, collected: 890.50 },
    { id: 3, date: '2026-10-12', category: 'Laboratory Diagnostics', invoices_count: 9, billed: 720.00, collected: 650.00 },
    { id: 4, date: '2026-10-12', category: 'Inpatient Admissions', invoices_count: 3, billed: 2100.00, collected: 1800.00 },
    { id: 5, date: '2026-10-11', category: 'Consultations', invoices_count: 18, billed: 1600.00, collected: 1550.00 },
    { id: 6, date: '2026-10-11', category: 'Pharmacy Sales', invoices_count: 32, billed: 1040.00, collected: 1040.00 },
    { id: 7, date: '2026-10-10', category: 'Inpatient Admissions', invoices_count: 4, billed: 2800.00, collected: 2400.00 },
];

export default function Reports() {
    const [activeTab, setActiveTab] = useState('financial');
    const [dateRange, setDateRange] = useState('today');

    const exportToCSV = (data, filename) => {
        if (!data || !data.length) return;
        const headers = Object.keys(data[0]).join(',');
        const rows = data.map(obj => Object.values(obj).map(val => `"${val}"`).join(','));
        const csvContent = [headers, ...rows].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const totalBilled = REVENUE_DATA.reduce((acc, cur) => acc + cur.billed, 0);
    const totalCollected = REVENUE_DATA.reduce((acc, cur) => acc + cur.collected, 0);

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Reports & Clinical Analytics</h1>
                    <p className="text-sm text-slate-500">Hospital financial performance, clinical throughput, and instant CSV export</p>
                </div>
                <button
                    onClick={() => exportToCSV(REVENUE_DATA, 'medicore_revenue_report')}
                    className="inline-flex items-center space-x-2 bg-gradient-to-r from-teal-600 to-teal-500 hover:from-teal-700 text-white font-medium px-4 py-2.5 rounded-lg shadow-md shadow-teal-500/20 text-sm transition"
                >
                    <Download className="w-4 h-4" />
                    <span>Export Report to CSV</span>
                </button>
            </div>

            {/* High-level KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                    <span className="text-xs font-semibold uppercase text-slate-400 block mb-1">Total Billed</span>
                    <h3 className="text-2xl font-black text-slate-800">${totalBilled.toLocaleString(undefined, { minimumFractionDigits: 2 })}</h3>
                    <span className="text-[11px] text-teal-600 font-medium">All clinical streams</span>
                </div>
                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                    <span className="text-xs font-semibold uppercase text-slate-400 block mb-1">Total Collected</span>
                    <h3 className="text-2xl font-black text-emerald-600">${totalCollected.toLocaleString(undefined, { minimumFractionDigits: 2 })}</h3>
                    <span className="text-[11px] text-emerald-700 font-semibold">{((totalCollected / totalBilled) * 100).toFixed(1)}% recovery rate</span>
                </div>
                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                    <span className="text-xs font-semibold uppercase text-slate-400 block mb-1">Pending Receivables</span>
                    <h3 className="text-2xl font-black text-rose-600">${(totalBilled - totalCollected).toLocaleString(undefined, { minimumFractionDigits: 2 })}</h3>
                    <span className="text-[11px] text-rose-500 font-medium">Unsettled insurance/cash</span>
                </div>
                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                    <span className="text-xs font-semibold uppercase text-slate-400 block mb-1">Total Invoices</span>
                    <h3 className="text-2xl font-black text-slate-800">107</h3>
                    <span className="text-[11px] text-slate-500 font-medium">Across 7 departments</span>
                </div>
            </div>

            {/* Data Breakdown Table */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200/80 overflow-hidden">
                <div className="p-4 border-b border-slate-200 flex items-center justify-between">
                    <h3 className="font-bold text-slate-800 text-sm">Revenue Breakdown by Department / Stream</h3>
                    <span className="text-xs text-slate-400">Export format: RFC 4180 CSV</span>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-slate-600">
                        <thead className="bg-slate-50 border-b border-slate-200 text-xs font-semibold uppercase text-slate-500 tracking-wider">
                            <tr>
                                <th className="px-5 py-3.5">Date</th>
                                <th className="px-5 py-3.5">Category Stream</th>
                                <th className="px-5 py-3.5">Invoices Count</th>
                                <th className="px-5 py-3.5">Billed Amount</th>
                                <th className="px-5 py-3.5">Collected</th>
                                <th className="px-5 py-3.5 text-right">Variance</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {REVENUE_DATA.map((row) => (
                                <tr key={row.id} className="hover:bg-slate-50/70 transition">
                                    <td className="px-5 py-4 font-mono text-xs text-slate-700">
                                        {row.date}
                                    </td>
                                    <td className="px-5 py-4 font-semibold text-slate-800">
                                        {row.category}
                                    </td>
                                    <td className="px-5 py-4 text-slate-700">
                                        {row.invoices_count} transactions
                                    </td>
                                    <td className="px-5 py-4 font-bold text-slate-800">
                                        ${row.billed.toFixed(2)}
                                    </td>
                                    <td className="px-5 py-4 font-bold text-emerald-600">
                                        ${row.collected.toFixed(2)}
                                    </td>
                                    <td className="px-5 py-4 text-right font-medium text-rose-600">
                                        -${(row.billed - row.collected).toFixed(2)}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
