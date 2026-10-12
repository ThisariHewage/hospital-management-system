import express from 'express';
import authRoutes from './authRoutes.js';
import auditRoutes from './auditRoutes.js';
import { getPatients, getPatientById, createPatient } from '../controllers/patientController.js';
import { getAppointments, getDoctors, createAppointment, updateAppointmentStatus } from '../controllers/appointmentController.js';
import {
    getMedicalRecords, createMedicalRecord,
    getLabTests, updateLabSampleStatus, updateLabResult,
    getMedicines, addMedicine, dispenseMedicine
} from '../controllers/clinicalController.js';
import { getBills, getBillById, createBill, recordPayment } from '../controllers/billingController.js';
import { getStaff, createStaff, getAttendance, markAttendance, getReportsSummary, triggerBackup } from '../controllers/staffReportController.js';
import { verifyToken } from '../middleware/authMiddleware.js';

const router = express.Router();

// System Health Check
router.get('/ping', (req, res) => {
    res.json({ message: 'HMS API Router Active', timestamp: new Date().toISOString() });
});

// Authentication & Audit Routes
router.use('/auth', authRoutes);
router.use('/audit-logs', auditRoutes);

// Patients Routes
router.get('/patients', getPatients);
router.get('/patients/:id', getPatientById);
router.post('/patients', createPatient);

// Appointments & Doctors Routes
router.get('/appointments', getAppointments);
router.post('/appointments', createAppointment);
router.patch('/appointments/:id/status', updateAppointmentStatus);
router.get('/doctors', getDoctors);

// EMR & Consultations
router.get('/emr', getMedicalRecords);
router.post('/emr', createMedicalRecord);

// Laboratory Tests
router.get('/laboratory', getLabTests);
router.patch('/laboratory/:id/sample', updateLabSampleStatus);
router.patch('/laboratory/:id/result', updateLabResult);

// Pharmacy & Inventory
router.get('/pharmacy', getMedicines);
router.post('/pharmacy', addMedicine);
router.post('/pharmacy/:id/dispense', dispenseMedicine);

// Billing & Invoices
router.get('/billing', getBills);
router.get('/billing/:id', getBillById);
router.post('/billing', createBill);
router.post('/billing/:id/pay', recordPayment);

// Staff & Attendance
router.get('/staff', getStaff);
router.post('/staff', createStaff);
router.get('/attendance', getAttendance);
router.post('/attendance', markAttendance);

// Reports & Backups
router.get('/reports/summary', getReportsSummary);
router.post('/backup/trigger', triggerBackup);

export default router;
