import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { TestTube2, CheckCircle2, Clock, FileCheck, Search, Filter, X } from 'lucide-react';

const INITIAL_TESTS = [
    { id: 1, test_code: 'LAB-2026-001', patient_name: 'James Wilson', patient_code: 'PAT-2026-0001', test_name: 'Lipid Profile Comprehensive', sample_type: 'Blood Serum', sample_status: 'COLLECTED', test_status: 'IN_PROGRESS', results: '', normal_range: 'Total Cholesterol < 200 mg/dL, HDL > 40 mg/dL, LDL < 100 mg/dL' },
    { id: 2, test_code: 'LAB-2026-002', patient_name: 'Eleanor Rigby', patient_code: 'PAT-2026-0002', test_name: 'Complete Blood Count (CBC)', sample_type: 'Whole Blood EDTA', sample_status: 'PENDING', test_status: 'PENDING', results: '', normal_range: 'WBC: 4.5-11.0 x10^3/µL, RBC: 4.2-5.4 x10^6/µL, Hemoglobin: 12-16 g/dL' },
    { id: 3, test_code: 'LAB-2026-003', patient_name: 'Sophia Martinez', patient_code: 'PAT-2026-0004', test_name: 'Fasting Blood Glucose', sample_type: 'Fluoride Plasma', sample_status: 'COLLECTED', test_status: 'COMPLETED', results: 'Fasting Glucose: 92 mg/dL (Normal)', normal_range: '70 - 99 mg/dL (Normal fasting)' },
];

export default function Laboratory() {
    const [tests, setTests] = useState(INITIAL_TESTS);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [selectedTest, setSelectedTest] = useState(null);
    const [resultText, setResultText] = useState('');

    const fetchTests = async () => {
        try {
            const res = await api.get('/laboratory');
            if (res.data?.tests?.length > 0) setTests(res.data.tests);
        } catch (e) {
            // fallback
        }
    };

    useEffect(() => {
        fetchTests();
    }, []);

    const handleCollectSample = async (testId) => {
        try {
            await api.patch(`/laboratory/${testId}/sample`, { sample_status: 'COLLECTED' });
        } catch (e) {
            // local update
        }
        setTests(tests.map(t => t.id === testId ? { ...t, sample_status: 'COLLECTED', test_status: 'IN_PROGRESS' } : t));
    };

    const handleOpenResultModal = (test) => {
        setSelectedTest(test);
        setResultText(test.results || '');
    };

    const handleSaveResult = async (e) => {
        e.preventDefault();
        try {
            await api.patch(`/laboratory/${selectedTest.id}/result`, { results: resultText });
        } catch (e) {
            // local update
        }
        setTests(tests.map(t => t.id === selectedTest.id ? { ...t, test_status: 'COMPLETED', results: resultText } : t));
        setSelectedTest(null);
    };

    const filtered = tests.filter(t => {
        const matchesSearch = t.patient_name?.toLowerCase().includes(search.toLowerCase()) ||
            t.test_code?.toLowerCase().includes(search.toLowerCase()) ||
            t.test_name?.toLowerCase().includes(search.toLowerCase());
        const matchesStatus = statusFilter ? t.test_status === statusFilter : true;
        return matchesSearch && matchesStatus;
    });

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Laboratory Order & Result Desk</h1>
                    <p className="text-sm text-slate-500">Manage sample collection, diagnostic analysis, and verified pathology reports</p>
                </div>
            </div>

            {/* Filter toolbar */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200/80 flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                        type="text"
                        placeholder="Search tests by patient, lab code, or test title..."
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
                        <option value="">All Test Statuses</option>
                        <option value="PENDING">Pending Sample</option>
                        <option value="IN_PROGRESS">In Progress</option>
                        <option value="COMPLETED">Completed</option>
                    </select>
                </div>
            </div>

            {/* Tests Table */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200/80 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-slate-600">
                        <thead className="bg-slate-50 border-b border-slate-200 text-xs font-semibold uppercase text-slate-500 tracking-wider">
                            <tr>
                                <th className="px-5 py-3.5">Order Code</th>
                                <th className="px-5 py-3.5">Patient</th>
                                <th className="px-5 py-3.5">Diagnostic Test</th>
                                <th className="px-5 py-3.5">Sample Status</th>
                                <th className="px-5 py-3.5">Report Status</th>
                                <th className="px-5 py-3.5 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filtered.map((t) => (
                                <tr key={t.id} className="hover:bg-slate-50/70 transition">
                                    <td className="px-5 py-4 font-mono font-medium text-teal-700">
                                        {t.test_code}
                                    </td>
                                    <td className="px-5 py-4">
                                        <p className="font-semibold text-slate-800">{t.patient_name}</p>
                                        <p className="text-xs text-slate-400 font-mono">{t.patient_code}</p>
                                    </td>
                                    <td className="px-5 py-4">
                                        <p className="font-medium text-slate-800">{t.test_name}</p>
                                        <p className="text-xs text-slate-400">Sample: {t.sample_type}</p>
                                    </td>
                                    <td className="px-5 py-4">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${t.sample_status === 'COLLECTED'
                                                ? 'bg-emerald-100 text-emerald-800'
                                                : 'bg-amber-100 text-amber-800'
                                            }`}>
                                            {t.sample_status}
                                        </span>
                                    </td>
                                    <td className="px-5 py-4">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${t.test_status === 'COMPLETED'
                                                ? 'bg-blue-100 text-blue-800'
                                                : 'bg-slate-100 text-slate-700'
                                            }`}>
                                            {t.test_status}
                                        </span>
                                    </td>
                                    <td className="px-5 py-4 text-right space-x-2">
                                        {t.sample_status === 'PENDING' && (
                                            <button
                                                onClick={() => handleCollectSample(t.id)}
                                                className="text-xs font-semibold text-teal-600 bg-teal-50 hover:bg-teal-100 px-3 py-1.5 rounded-lg transition"
                                            >
                                                Collect Sample
                                            </button>
                                        )}
                                        <button
                                            onClick={() => handleOpenResultModal(t)}
                                            className="text-xs font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition"
                                        >
                                            {t.test_status === 'COMPLETED' ? 'View/Edit Result' : 'Enter Results'}
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Test Results Entry Modal */}
            {selectedTest && (
                <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 border border-slate-200">
                        <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
                            <div>
                                <span className="font-mono text-xs font-bold text-teal-600">{selectedTest.test_code}</span>
                                <h3 className="text-lg font-bold text-slate-800">{selectedTest.test_name}</h3>
                            </div>
                            <button onClick={() => setSelectedTest(null)} className="text-slate-400 hover:text-slate-600">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <form onSubmit={handleSaveResult} className="space-y-4">
                            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs space-y-1">
                                <p><strong>Patient:</strong> {selectedTest.patient_name} ({selectedTest.patient_code})</p>
                                <p><strong>Reference Range:</strong> {selectedTest.normal_range}</p>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">
                                    Laboratory Findings & Measured Values *
                                </label>
                                <textarea
                                    rows="4"
                                    required
                                    value={resultText}
                                    onChange={(e) => setResultText(e.target.value)}
                                    className="w-full text-sm border rounded-lg p-3 font-mono focus:ring-2 focus:ring-teal-500"
                                    placeholder="Enter verified values, parameter findings and lab technician remarks..."
                                />
                            </div>

                            <div className="pt-2 flex justify-end space-x-2">
                                <button type="button" onClick={() => setSelectedTest(null)} className="px-3 py-1.5 text-xs text-slate-600">
                                    Cancel
                                </button>
                                <button type="submit" className="px-4 py-2 text-xs bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-sm">
                                    Publish Verified Report
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
