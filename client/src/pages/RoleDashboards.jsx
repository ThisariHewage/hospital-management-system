import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ROLE_DETAILS } from '../utils/rbacConfig';
import {
    Activity, Users, Calendar, Stethoscope, TestTube2,
    Pill, Receipt, UserCheck, ShieldCheck, BedDouble,
    AlertTriangle, CheckCircle2, Clock, ArrowRight,
    TrendingUp, FileText, Database, HeartPulse, Building2
} from 'lucide-react';

/**
 * Common Header Card for Role Dashboards
 */
function RoleDashboardHeader({ title, subtitle, icon: Icon, badgeColor }) {
    const { user, role } = useAuth();
    const details = ROLE_DETAILS[role] || { title: role };

    return (
        <div className="bg-gradient-to-r from-slate-900 via-teal-950 to-slate-900 border border-slate-800 p-6 md:p-8 rounded-2xl text-white shadow-xl relative overflow-hidden">
            <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-teal-500/5 blur-3xl pointer-events-none"></div>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
                <div>
                    <div className="flex items-center space-x-2.5 mb-2">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${details.badge}`}>
                            <Icon className="w-3.5 h-3.5 mr-1.5" />
                            {details.title}
                        </span>
                        <span className="text-xs text-slate-400">Authenticated Session</span>
                    </div>
                    <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white">
                        {title}
                    </h1>
                    <p className="text-xs md:text-sm text-slate-300 mt-1 max-w-xl">
                        {subtitle}
                    </p>
                </div>
                <div className="bg-slate-900/80 border border-slate-800/80 rounded-xl p-3.5 shrink-0 text-right">
                    <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Logged In Personnel</p>
                    <p className="text-sm font-bold text-teal-300 mt-0.5">{user?.full_name || user?.username}</p>
                    <p className="text-xs text-slate-400 font-mono">@{user?.username} • {user?.email}</p>
                </div>
            </div>
        </div>
    );
}

/**
 * 1. ADMIN DASHBOARD (/admin/dashboard)
 */
export function AdminDashboard() {
    return (
        <div className="space-y-6 max-w-7xl mx-auto">
            <RoleDashboardHeader
                title="System Administration & Hospital Governance"
                subtitle="Oversee users, clinical departments, appointments, financial compliance, and audit security snapshots."
                icon={ShieldCheck}
                badgeColor="purple"
            />

            {/* Quick Management Links */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <Link to="/patients" className="p-4 bg-white rounded-xl border border-slate-200 hover:border-teal-500 transition shadow-sm hover:shadow group flex items-center space-x-3">
                    <div className="p-2.5 rounded-lg bg-teal-50 text-teal-600 group-hover:bg-teal-600 group-hover:text-white transition">
                        <Users className="w-5 h-5" />
                    </div>
                    <div>
                        <p className="text-xs font-bold text-slate-800">Patients Directory</p>
                        <p className="text-[11px] text-slate-500">View & Register</p>
                    </div>
                </Link>
                <Link to="/staff" className="p-4 bg-white rounded-xl border border-slate-200 hover:border-teal-500 transition shadow-sm hover:shadow group flex items-center space-x-3">
                    <div className="p-2.5 rounded-lg bg-indigo-50 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition">
                        <UserCheck className="w-5 h-5" />
                    </div>
                    <div>
                        <p className="text-xs font-bold text-slate-800">Staff & Payroll</p>
                        <p className="text-[11px] text-slate-500">Personnel & Attendance</p>
                    </div>
                </Link>
                <Link to="/reports" className="p-4 bg-white rounded-xl border border-slate-200 hover:border-teal-500 transition shadow-sm hover:shadow group flex items-center space-x-3">
                    <div className="p-2.5 rounded-lg bg-amber-50 text-amber-600 group-hover:bg-amber-600 group-hover:text-white transition">
                        <TrendingUp className="w-5 h-5" />
                    </div>
                    <div>
                        <p className="text-xs font-bold text-slate-800">Analytics & Reports</p>
                        <p className="text-[11px] text-slate-500">CSV Export & KPIs</p>
                    </div>
                </Link>
                <Link to="/audit-logs" className="p-4 bg-white rounded-xl border border-slate-200 hover:border-teal-500 transition shadow-sm hover:shadow group flex items-center space-x-3">
                    <div className="p-2.5 rounded-lg bg-purple-50 text-purple-600 group-hover:bg-purple-600 group-hover:text-white transition">
                        <Database className="w-5 h-5" />
                    </div>
                    <div>
                        <p className="text-xs font-bold text-slate-800">Audit Logs & Backup</p>
                        <p className="text-[11px] text-slate-500">Security & Snapshots</p>
                    </div>
                </Link>
            </div>


        </div>
    );
}

/**
 * 2. DOCTOR DASHBOARD (/doctor/dashboard)
 */
export function DoctorDashboard() {
    return (
        <div className="space-y-6 max-w-7xl mx-auto">
            <RoleDashboardHeader
                title="Physician Clinical Consultation Desk"
                subtitle="Review assigned appointments, examine patient medical histories, record diagnoses, and prescribe medications."
                icon={Stethoscope}
                badgeColor="teal"
            />

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Link to="/appointments" className="p-4 bg-white rounded-xl border border-slate-200 hover:border-teal-500 transition shadow-sm hover:shadow group flex items-center space-x-3">
                    <div className="p-3 rounded-lg bg-teal-50 text-teal-600 group-hover:bg-teal-600 group-hover:text-white transition">
                        <Calendar className="w-5 h-5" />
                    </div>
                    <div>
                        <p className="text-sm font-bold text-slate-800">My Appointments</p>
                        <p className="text-xs text-slate-500">Check today's patient queue</p>
                    </div>
                </Link>
                <Link to="/emr" className="p-4 bg-white rounded-xl border border-slate-200 hover:border-teal-500 transition shadow-sm hover:shadow group flex items-center space-x-3">
                    <div className="p-3 rounded-lg bg-rose-50 text-rose-600 group-hover:bg-rose-600 group-hover:text-white transition">
                        <Stethoscope className="w-5 h-5" />
                    </div>
                    <div>
                        <p className="text-sm font-bold text-slate-800">EMR Consultations</p>
                        <p className="text-xs text-slate-500">Diagnoses & Prescriptions</p>
                    </div>
                </Link>
                <Link to="/patients" className="p-4 bg-white rounded-xl border border-slate-200 hover:border-teal-500 transition shadow-sm hover:shadow group flex items-center space-x-3">
                    <div className="p-3 rounded-lg bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition">
                        <Users className="w-5 h-5" />
                    </div>
                    <div>
                        <p className="text-sm font-bold text-slate-800">Patient Records</p>
                        <p className="text-xs text-slate-500">Medical history & charts</p>
                    </div>
                </Link>
            </div>

            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                <h3 className="text-sm font-bold text-slate-800 mb-2">Physician Operational Guidelines</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                    All consultation entries, diagnostic formulations, and electronic prescriptions recorded through your account are cryptographically tagged with your physician ID and logged to the central hospital audit registry.
                </p>
            </div>
        </div>
    );
}

/**
 * 3. NURSE DASHBOARD (/nurse/dashboard)
 */
export function NurseDashboard() {
    return (
        <div className="space-y-6 max-w-7xl mx-auto">
            <RoleDashboardHeader
                title="Inpatient Ward Care & Nursing Desk"
                subtitle="Monitor admitted patients, assign and inspect bed occupancies, record vital signs, and update inpatient charts."
                icon={HeartPulse}
                badgeColor="rose"
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Link to="/admissions" className="p-5 bg-white rounded-xl border border-slate-200 hover:border-rose-500 transition shadow-sm hover:shadow group flex items-center space-x-4">
                    <div className="p-3.5 rounded-xl bg-rose-50 text-rose-600 group-hover:bg-rose-600 group-hover:text-white transition">
                        <BedDouble className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-sm font-bold text-slate-800">Inpatient Admissions & Vitals</p>
                        <p className="text-xs text-slate-500 mt-0.5">Manage ICU, Deluxe, and General Ward beds</p>
                    </div>
                </Link>
                <Link to="/patients" className="p-5 bg-white rounded-xl border border-slate-200 hover:border-rose-500 transition shadow-sm hover:shadow group flex items-center space-x-4">
                    <div className="p-3.5 rounded-xl bg-teal-50 text-teal-600 group-hover:bg-teal-600 group-hover:text-white transition">
                        <Users className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-sm font-bold text-slate-800">Patient Directory</p>
                        <p className="text-xs text-slate-500 mt-0.5">Look up patient history, allergies, and blood groups</p>
                    </div>
                </Link>
            </div>

            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                <h3 className="text-sm font-bold text-slate-800 mb-2">Nursing Shift Protocols</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                    Ensure inpatient vitals (Blood Pressure, Heart Rate, Respiratory Rate, and Temperature) are recorded upon every ward round. For admissions requiring bed transfers, notify the front desk.
                </p>
            </div>
        </div>
    );
}

/**
 * 4. RECEPTIONIST DASHBOARD (/receptionist/dashboard)
 */
export function ReceptionistDashboard() {
    return (
        <div className="space-y-6 max-w-7xl mx-auto">
            <RoleDashboardHeader
                title="Front Desk & Reception Desk"
                subtitle="Register arriving patients, book doctor appointments, coordinate patient intake, and prepare initial consultation invoices."
                icon={Building2}
                badgeColor="amber"
            />

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Link to="/patients" className="p-4 bg-white rounded-xl border border-slate-200 hover:border-amber-500 transition shadow-sm hover:shadow group flex items-center space-x-3">
                    <div className="p-3 rounded-lg bg-teal-50 text-teal-600 group-hover:bg-teal-600 group-hover:text-white transition">
                        <Users className="w-5 h-5" />
                    </div>
                    <div>
                        <p className="text-sm font-bold text-slate-800">Patient Intake</p>
                        <p className="text-xs text-slate-500">Register new patient files</p>
                    </div>
                </Link>
                <Link to="/appointments" className="p-4 bg-white rounded-xl border border-slate-200 hover:border-amber-500 transition shadow-sm hover:shadow group flex items-center space-x-3">
                    <div className="p-3 rounded-lg bg-amber-50 text-amber-600 group-hover:bg-amber-600 group-hover:text-white transition">
                        <Calendar className="w-5 h-5" />
                    </div>
                    <div>
                        <p className="text-sm font-bold text-slate-800">Appointments</p>
                        <p className="text-xs text-slate-500">Schedule & reschedule visits</p>
                    </div>
                </Link>
                <Link to="/billing" className="p-4 bg-white rounded-xl border border-slate-200 hover:border-amber-500 transition shadow-sm hover:shadow group flex items-center space-x-3">
                    <div className="p-3 rounded-lg bg-emerald-50 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition">
                        <Receipt className="w-5 h-5" />
                    </div>
                    <div>
                        <p className="text-sm font-bold text-slate-800">Billing Counter</p>
                        <p className="text-xs text-slate-500">Collect consultation fees</p>
                    </div>
                </Link>
            </div>
        </div>
    );
}

/**
 * 5. LAB STAFF DASHBOARD (/laboratory/dashboard)
 */
export function LabDashboard() {
    return (
        <div className="space-y-6 max-w-7xl mx-auto">
            <RoleDashboardHeader
                title="Pathology & Diagnostic Laboratory Desk"
                subtitle="Process physician diagnostic test orders, update specimen collection status, and enter verified laboratory results."
                icon={TestTube2}
                badgeColor="blue"
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Link to="/laboratory" className="p-5 bg-white rounded-xl border border-slate-200 hover:border-blue-500 transition shadow-sm hover:shadow group flex items-center space-x-4">
                    <div className="p-3.5 rounded-xl bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition">
                        <TestTube2 className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-sm font-bold text-slate-800">Lab Orders & Results Entry</p>
                        <p className="text-xs text-slate-500 mt-0.5">Collect specimens, execute tests, and certify findings</p>
                    </div>
                </Link>
            </div>

            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                <h3 className="text-sm font-bold text-slate-800 mb-2">Quality & Specimen Safety</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                    Always confirm patient identifier code (`patient_code`) before barcode specimen labelling. Results published are immediately visible to treating physicians on the EMR desk.
                </p>
            </div>
        </div>
    );
}

/**
 * 6. PHARMACIST DASHBOARD (/pharmacy/dashboard)
 */
export function PharmacyDashboard() {
    return (
        <div className="space-y-6 max-w-7xl mx-auto">
            <RoleDashboardHeader
                title="Hospital Pharmacy & Drug Dispensary"
                subtitle="Review doctor electronic prescriptions, monitor medicine inventory, inspect low-stock alerts, and fulfill dispensing requests."
                icon={Pill}
                badgeColor="emerald"
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Link to="/pharmacy" className="p-5 bg-white rounded-xl border border-slate-200 hover:border-emerald-500 transition shadow-sm hover:shadow group flex items-center space-x-4">
                    <div className="p-3.5 rounded-xl bg-emerald-50 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition">
                        <Pill className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-sm font-bold text-slate-800">Pharmacy Inventory & Dispense</p>
                        <p className="text-xs text-slate-500 mt-0.5">Check inventory stock, batch expiries, and dispense drugs</p>
                    </div>
                </Link>
            </div>

            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                <h3 className="text-sm font-bold text-slate-800 mb-2">Prescription Dispensing Protocol</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                    Verify dosage, frequency, and duration against electronic medical record orders before handing medication to outpatient or ward personnel.
                </p>
            </div>
        </div>
    );
}

/**
 * 7. ACCOUNTANT DASHBOARD (/accountant/dashboard)
 */
export function AccountantDashboard() {
    return (
        <div className="space-y-6 max-w-7xl mx-auto">
            <RoleDashboardHeader
                title="Finance, Invoicing & Accounts Desk"
                subtitle="Manage patient bills, record settlement receipts, oversee employee payroll, and generate hospital financial revenue reports."
                icon={Receipt}
                badgeColor="indigo"
            />

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Link to="/billing" className="p-4 bg-white rounded-xl border border-slate-200 hover:border-indigo-500 transition shadow-sm hover:shadow group flex items-center space-x-3">
                    <div className="p-3 rounded-lg bg-emerald-50 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition">
                        <Receipt className="w-5 h-5" />
                    </div>
                    <div>
                        <p className="text-sm font-bold text-slate-800">Invoices & Billing</p>
                        <p className="text-xs text-slate-500">Record payments & print receipts</p>
                    </div>
                </Link>
                <Link to="/staff" className="p-4 bg-white rounded-xl border border-slate-200 hover:border-indigo-500 transition shadow-sm hover:shadow group flex items-center space-x-3">
                    <div className="p-3 rounded-lg bg-indigo-50 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition">
                        <UserCheck className="w-5 h-5" />
                    </div>
                    <div>
                        <p className="text-sm font-bold text-slate-800">Payroll & Staff</p>
                        <p className="text-xs text-slate-500">Attendance & salary records</p>
                    </div>
                </Link>
                <Link to="/reports" className="p-4 bg-white rounded-xl border border-slate-200 hover:border-indigo-500 transition shadow-sm hover:shadow group flex items-center space-x-3">
                    <div className="p-3 rounded-lg bg-amber-50 text-amber-600 group-hover:bg-amber-600 group-hover:text-white transition">
                        <TrendingUp className="w-5 h-5" />
                    </div>
                    <div>
                        <p className="text-sm font-bold text-slate-800">Financial Reports</p>
                        <p className="text-xs text-slate-500">Revenue breakdowns & CSV export</p>
                    </div>
                </Link>
            </div>
        </div>
    );
}

export default {
    AdminDashboard,
    DoctorDashboard,
    NurseDashboard,
    ReceptionistDashboard,
    LabDashboard,
    PharmacyDashboard,
    AccountantDashboard
};
