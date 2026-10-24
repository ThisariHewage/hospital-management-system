import pool from '../config/db.js';
import { logAudit } from '../middleware/auditLogger.js';

export const getAdmissions = async (req, res) => {
    try {
        const params = [];
        let doctorScope = '';
        if (req.user.role === 'DOCTOR') {
            doctorScope = ` AND EXISTS (
                SELECT 1 FROM appointments ap
                JOIN doctors doc ON doc.id = ap.doctor_id
                WHERE ap.patient_id = a.patient_id AND doc.user_id = ?
            )`;
            params.push(req.user.id);
        }

        const [admissions] = await pool.query(`
            SELECT a.*, p.full_name AS patient_name, p.patient_code, dep.name AS department,
                   latest.bp, latest.o2, latest.temp, latest.pulse, latest.recorded_at AS vitals_recorded_at
            FROM admissions a
            JOIN patients p ON p.id = a.patient_id
            JOIN departments dep ON dep.id = a.department_id
            LEFT JOIN inpatient_vitals latest ON latest.id = (
                SELECT iv.id FROM inpatient_vitals iv WHERE iv.admission_id = a.id
                ORDER BY iv.recorded_at DESC, iv.id DESC LIMIT 1
            )
            WHERE 1=1${doctorScope}
            ORDER BY a.admit_date DESC`, params);
        res.json({ success: true, admissions });
    } catch (error) {
        console.error('getAdmissions error:', error);
        res.status(500).json({ success: false, message: 'Failed to retrieve admissions.' });
    }
};

export const createAdmission = async (req, res) => {
    try {
        const { patient_id, department_id, bed_number, room_type, daily_rate, diagnosis } = req.body;
        if (!patient_id || !department_id || !bed_number) {
            return res.status(400).json({ success: false, message: 'Patient, department, and bed number are required.' });
        }
        const [active] = await pool.query('SELECT id FROM admissions WHERE patient_id = ? AND status = \'ADMITTED\' LIMIT 1', [patient_id]);
        if (active.length) return res.status(409).json({ success: false, message: 'This patient is already admitted.' });

        const admissionCode = `ADM-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
        const [result] = await pool.query(
            `INSERT INTO admissions (admission_code, patient_id, department_id, bed_number, room_type, daily_rate, diagnosis)
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [admissionCode, patient_id, department_id, bed_number, room_type || 'General', daily_rate || 100, diagnosis || null]
        );
        await logAudit(req.user.id, 'CREATE_ADMISSION', 'admissions', result.insertId, `Created admission ${admissionCode}`, req);
        res.status(201).json({ success: true, admissionId: result.insertId, admission_code: admissionCode });
    } catch (error) {
        console.error('createAdmission error:', error);
        res.status(500).json({ success: false, message: 'Failed to create admission.' });
    }
};

export const recordVitals = async (req, res) => {
    try {
        const { bp, o2, temp, pulse } = req.body;
        const [admission] = await pool.query('SELECT id FROM admissions WHERE id = ? AND status = \'ADMITTED\'', [req.params.id]);
        if (!admission.length) return res.status(404).json({ success: false, message: 'Active admission not found.' });
        await pool.query(
            'INSERT INTO inpatient_vitals (admission_id, recorded_by, bp, o2, temp, pulse) VALUES (?, ?, ?, ?, ?, ?)',
            [req.params.id, req.user.id, bp || null, o2 || null, temp || null, pulse || null]
        );
        await logAudit(req.user.id, 'RECORD_INPATIENT_VITALS', 'admissions', req.params.id, 'Recorded inpatient vital signs', req);
        res.json({ success: true, message: 'Vitals recorded.' });
    } catch (error) {
        console.error('recordVitals error:', error);
        res.status(500).json({ success: false, message: 'Failed to record vitals.' });
    }
};

export const dischargeAdmission = async (req, res) => {
    try {
        const [result] = await pool.query(
            'UPDATE admissions SET status = \'DISCHARGED\', discharge_date = NOW() WHERE id = ? AND status = \'ADMITTED\'',
            [req.params.id]
        );
        if (!result.affectedRows) return res.status(404).json({ success: false, message: 'Active admission not found.' });
        await logAudit(req.user.id, 'DISCHARGE_PATIENT', 'admissions', req.params.id, 'Patient discharged', req);
        res.json({ success: true, message: 'Patient discharged.' });
    } catch (error) {
        console.error('dischargeAdmission error:', error);
        res.status(500).json({ success: false, message: 'Failed to discharge patient.' });
    }
};
