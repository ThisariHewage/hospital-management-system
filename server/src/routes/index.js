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
import { requireRoles } from '../middleware/roleMiddleware.js';

const router = express.Router();

// System Health Check
router.get('/ping', (req, res) => {
    res.json({ message: 'HMS API Router Active', timestamp: new Date().toISOString() });
});

// Authentication Endpoints (Public + me)
router.use('/auth', authRoutes);

// Audit Logs (ADMIN only)
router.use('/audit-logs', verifyToken, requireRoles('ADMIN'), auditRoutes);

// Patients Routes (ADMIN, DOCTOR, NURSE, RECEPTIONIST)
router.get('/patients', verifyToken, requireRoles('ADMIN', 'DOCTOR', 'NURSE', 'RECEPTIONIST'), getPatients);
router.get('/patients/:id', verifyToken, requireRoles('ADMIN', 'DOCTOR', 'NURSE', 'RECEPTIONIST'), getPatientById);
router.post('/patients', verifyToken, requireRoles('ADMIN', 'RECEPTIONIST'), createPatient);

// Appointments & Doctors Routes (ADMIN, DOCTOR, RECEPTIONIST)
router.get('/appointments', verifyToken, requireRoles('ADMIN', 'DOCTOR', 'RECEPTIONIST'), getAppointments);
router.post('/appointments', verifyToken, requireRoles('ADMIN', 'RECEPTIONIST'), createAppointment);
router.patch('/appointments/:id/status', verifyToken, requireRoles('ADMIN', 'DOCTOR', 'RECEPTIONIST'), updateAppointmentStatus);
router.get('/doctors', verifyToken, requireRoles('ADMIN', 'DOCTOR', 'NURSE', 'RECEPTIONIST'), getDoctors);

// EMR & Consultations (ADMIN, DOCTOR)
router.get('/emr', verifyToken, requireRoles('ADMIN', 'DOCTOR'), getMedicalRecords);
router.post('/emr', verifyToken, requireRoles('ADMIN', 'DOCTOR'), createMedicalRecord);

// Laboratory Tests (ADMIN, LAB_STAFF)
router.get('/laboratory', verifyToken, requireRoles('ADMIN', 'LAB_STAFF'), getLabTests);
router.patch('/laboratory/:id/sample', verifyToken, requireRoles('ADMIN', 'LAB_STAFF'), updateLabSampleStatus);
router.patch('/laboratory/:id/result', verifyToken, requireRoles('ADMIN', 'LAB_STAFF'), updateLabResult);

// Pharmacy & Inventory (ADMIN, PHARMACIST)
router.get('/pharmacy', verifyToken, requireRoles('ADMIN', 'PHARMACIST'), getMedicines);
router.post('/pharmacy', verifyToken, requireRoles('ADMIN', 'PHARMACIST'), addMedicine);
router.post('/pharmacy/:id/dispense', verifyToken, requireRoles('ADMIN', 'PHARMACIST'), dispenseMedicine);

// Billing & Invoices (ADMIN, RECEPTIONIST, ACCOUNTANT)
router.get('/billing', verifyToken, requireRoles('ADMIN', 'RECEPTIONIST', 'ACCOUNTANT'), getBills);
router.get('/billing/:id', verifyToken, requireRoles('ADMIN', 'RECEPTIONIST', 'ACCOUNTANT'), getBillById);
router.post('/billing', verifyToken, requireRoles('ADMIN', 'RECEPTIONIST', 'ACCOUNTANT'), createBill);
router.post('/billing/:id/pay', verifyToken, requireRoles('ADMIN', 'ACCOUNTANT'), recordPayment);

// Staff & Attendance (ADMIN, ACCOUNTANT)
router.get('/staff', verifyToken, requireRoles('ADMIN', 'ACCOUNTANT'), getStaff);
router.post('/staff', verifyToken, requireRoles('ADMIN'), createStaff);
router.get('/attendance', verifyToken, requireRoles('ADMIN', 'ACCOUNTANT'), getAttendance);
router.post('/attendance', verifyToken, requireRoles('ADMIN'), markAttendance);

// Reports & Backups (ADMIN, ACCOUNTANT)
router.get('/reports/summary', verifyToken, requireRoles('ADMIN', 'ACCOUNTANT'), getReportsSummary);
router.post('/backup/trigger', verifyToken, requireRoles('ADMIN'), triggerBackup);

export default router;
