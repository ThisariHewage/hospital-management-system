import pool from '../config/db.js';
import { logAudit } from '../middleware/auditLogger.js';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DOCUMENTS_DIR = path.resolve(__dirname, '../../uploads/patient-documents');
const MAX_DOCUMENT_SIZE = 5 * 1024 * 1024;

export const getPatients = async (req, res) => {
    try {
        const { search = '', blood_group = '', gender = '' } = req.query;
        let query = `SELECT * FROM patients WHERE 1=1`;
        const params = [];

        if (search) {
            query += ` AND (full_name LIKE ? OR patient_code LIKE ? OR phone LIKE ?)`;
            params.push(`%${search}%`, `%${search}%`, `%${search}%`);
        }
        if (blood_group) {
            query += ` AND blood_group = ?`;
            params.push(blood_group);
        }
        if (gender) {
            query += ` AND gender = ?`;
            params.push(gender);
        }

        query += ` ORDER BY id DESC LIMIT 100`;
        const [patients] = await pool.query(query, params);
        res.json({ success: true, count: patients.length, patients });
    } catch (error) {
        console.error('getPatients error:', error);
        res.status(500).json({ success: false, message: 'Failed to retrieve patients.' });
    }
};

export const getPatientById = async (req, res) => {
    try {
        const [patients] = await pool.query('SELECT * FROM patients WHERE id = ?', [req.params.id]);
        if (patients.length === 0) {
            return res.status(404).json({ success: false, message: 'Patient not found.' });
        }

        const patient = patients[0];
        // Fetch medical history, appointments, and bills
        const [records] = await pool.query(
            `SELECT m.*, d.full_name as doctor_name
             FROM medical_records m
             LEFT JOIN doctors d ON m.doctor_id = d.id
             WHERE m.patient_id = ? ORDER BY m.visit_date DESC`,
            [patient.id]
        );
        const [appointments] = await pool.query(
            `SELECT a.*, d.full_name as doctor_name
             FROM appointments a
             LEFT JOIN doctors d ON a.doctor_id = d.id
             WHERE a.patient_id = ? ORDER BY a.appointment_date DESC`,
            [patient.id]
        );
        const [bills] = await pool.query('SELECT * FROM bills WHERE patient_id = ? ORDER BY id DESC', [patient.id]);
        const [documents] = await pool.query(
            'SELECT id, title, file_type, uploaded_at FROM patient_documents WHERE patient_id = ? ORDER BY uploaded_at DESC',
            [patient.id]
        );

        res.json({ success: true, patient, records, appointments, bills, documents });
    } catch (error) {
        console.error('getPatientById error:', error);
        res.status(500).json({ success: false, message: 'Failed to retrieve patient details.' });
    }
};

export const updatePatient = async (req, res) => {
    try {
        const { full_name, dob, gender, phone, email, address, blood_group, emergency_contact } = req.body;
        if (!full_name || !gender || !phone) {
            return res.status(400).json({ success: false, message: 'Full name, gender, and phone are required.' });
        }
        const [result] = await pool.query(
            `UPDATE patients SET full_name = ?, dob = ?, gender = ?, phone = ?, email = ?, address = ?, blood_group = ?, emergency_contact = ?
             WHERE id = ?`,
            [full_name, dob || null, gender, phone, email || null, address || null, blood_group || null, emergency_contact || null, req.params.id]
        );
        if (!result.affectedRows) return res.status(404).json({ success: false, message: 'Patient not found.' });
        await logAudit(req.user?.id, 'UPDATE_PATIENT', 'patients', req.params.id, `Updated patient profile for ${full_name}`, req);
        res.json({ success: true, message: 'Patient information updated.' });
    } catch (error) {
        console.error('updatePatient error:', error);
        res.status(500).json({ success: false, message: 'Failed to update patient information.' });
    }
};

export const uploadPatientDocument = async (req, res) => {
    try {
        const { title, fileName, mimeType, data } = req.body;
        if (!title || !fileName || !data) return res.status(400).json({ success: false, message: 'Document title and file are required.' });
        const [patients] = await pool.query('SELECT id FROM patients WHERE id = ?', [req.params.id]);
        if (!patients.length) return res.status(404).json({ success: false, message: 'Patient not found.' });
        const base64 = String(data).replace(/^data:[^;]+;base64,/, '');
        const buffer = Buffer.from(base64, 'base64');
        if (!buffer.length || buffer.length > MAX_DOCUMENT_SIZE) return res.status(400).json({ success: false, message: 'Document must be smaller than 5 MB.' });
        const extension = path.extname(fileName).toLowerCase();
        if (!['.pdf', '.png', '.jpg', '.jpeg'].includes(extension)) return res.status(400).json({ success: false, message: 'Only PDF, PNG, and JPG documents are allowed.' });
        await fs.mkdir(DOCUMENTS_DIR, { recursive: true });
        const storedName = `${req.params.id}-${Date.now()}${extension}`;
        await fs.writeFile(path.join(DOCUMENTS_DIR, storedName), buffer);
        const [result] = await pool.query(
            'INSERT INTO patient_documents (patient_id, title, file_url, file_type) VALUES (?, ?, ?, ?)',
            [req.params.id, title, storedName, mimeType || extension.slice(1)]
        );
        await logAudit(req.user?.id, 'UPLOAD_PATIENT_DOCUMENT', 'patient_documents', result.insertId, `Uploaded ${title} for patient ${req.params.id}`, req);
        res.status(201).json({ success: true, document: { id: result.insertId, title, file_type: mimeType || extension.slice(1) } });
    } catch (error) {
        console.error('uploadPatientDocument error:', error);
        res.status(500).json({ success: false, message: 'Failed to upload patient document.' });
    }
};

export const downloadPatientDocument = async (req, res) => {
    try {
        const [documents] = await pool.query('SELECT title, file_url FROM patient_documents WHERE id = ?', [req.params.documentId]);
        if (!documents.length) return res.status(404).json({ success: false, message: 'Document not found.' });
        const filePath = path.resolve(DOCUMENTS_DIR, documents[0].file_url);
        if (!filePath.startsWith(DOCUMENTS_DIR)) return res.status(400).json({ success: false, message: 'Invalid document path.' });
        res.download(filePath, documents[0].title);
    } catch (error) {
        console.error('downloadPatientDocument error:', error);
        res.status(404).json({ success: false, message: 'Document file is unavailable.' });
    }
};

export const createPatient = async (req, res) => {
    try {
        const { full_name, dob, gender, phone, email, address, blood_group, emergency_contact } = req.body;

        if (!full_name || !gender || !phone) {
            return res.status(400).json({ success: false, message: 'Full name, gender, and phone are required.' });
        }

        // Generate unique patient code PAT-YYYY-XXXX
        const year = new Date().getFullYear();
        const randomCode = Math.floor(1000 + Math.random() * 9000);
        const patient_code = `PAT-${year}-${randomCode}`;

        const [result] = await pool.query(
            `INSERT INTO patients (patient_code, full_name, dob, gender, phone, email, address, blood_group, emergency_contact)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [patient_code, full_name, dob || null, gender, phone, email || null, address || null, blood_group || null, emergency_contact || null]
        );

        await logAudit(req.user?.id, 'CREATE_PATIENT', 'patients', result.insertId, `Registered patient ${full_name} (${patient_code})`, req);

        res.status(201).json({
            success: true,
            message: 'Patient registered successfully.',
            patient: { id: result.insertId, patient_code, full_name, phone, blood_group }
        });
    } catch (error) {
        console.error('createPatient error:', error);
        res.status(500).json({ success: false, message: 'Failed to create patient.' });
    }
};

export default { getPatients, getPatientById, createPatient, updatePatient, uploadPatientDocument, downloadPatientDocument };
