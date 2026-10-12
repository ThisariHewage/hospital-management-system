import pool from '../config/db.js';
import { logAudit } from '../middleware/auditLogger.js';

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

        res.json({ success: true, patient, records, appointments, bills });
    } catch (error) {
        console.error('getPatientById error:', error);
        res.status(500).json({ success: false, message: 'Failed to retrieve patient details.' });
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

export default { getPatients, getPatientById, createPatient };
