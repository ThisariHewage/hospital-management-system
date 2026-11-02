import pool from '../config/db.js';
import { logAudit } from '../middleware/auditLogger.js';

// ==========================================
// EMR (Medical Records & Prescriptions)
// ==========================================
export const getConsultationPatients = async (req, res) => {
    try {
        const params = [];
        let doctorFilter = '';

        if (req.user?.role === 'DOCTOR') {
            const [doctorRows] = await pool.query(
                'SELECT id FROM doctors WHERE user_id = ? LIMIT 1',
                [req.user.id]
            );

            if (doctorRows.length === 0) {
                return res.json({ success: true, patients: [] });
            }

            doctorFilter = ' AND a.doctor_id = ?';
            params.push(doctorRows[0].id);
        }

        const [patients] = await pool.query(`
            SELECT p.id, p.full_name, p.patient_code, p.gender, p.blood_group,
                   a.doctor_id, d.full_name AS doctor_name, a.appointment_date,
                   a.time_slot, a.reason
            FROM appointments a
            JOIN patients p ON p.id = a.patient_id
            JOIN doctors d ON d.id = a.doctor_id
            WHERE a.status IN ('SCHEDULED', 'RESCHEDULED')${doctorFilter}
            ORDER BY a.appointment_date ASC, a.time_slot ASC
        `, params);

        res.json({ success: true, patients });
    } catch (error) {
        console.error('getConsultationPatients error:', error);
        res.status(500).json({ success: false, message: 'Failed to retrieve consultation patients.' });
    }
};

export const getMedicalRecords = async (req, res) => {
    try {
        const { patient_id } = req.query;
        let query = `
            SELECT m.*, p.full_name AS patient_name, p.patient_code, d.full_name AS doctor_name
            FROM medical_records m
            JOIN patients p ON m.patient_id = p.id
            JOIN doctors d ON m.doctor_id = d.id
            WHERE 1=1
        `;
        const params = [];
        if (patient_id) {
            query += ` AND m.patient_id = ?`;
            params.push(patient_id);
        }
        query += ` ORDER BY m.visit_date DESC LIMIT 50`;
        const [records] = await pool.query(query, params);
        res.json({ success: true, records });
    } catch (error) {
        console.error('getMedicalRecords error:', error);
        res.status(500).json({ success: false, message: 'Failed to retrieve medical records.' });
    }
};

export const createMedicalRecord = async (req, res) => {
    try {
        const { patient_id, symptoms, diagnosis, treatment_plan, vitals, prescriptions } = req.body;

        if (!patient_id || !diagnosis) {
            return res.status(400).json({ success: false, message: 'Patient, doctor, and diagnosis are required.' });
        }

        let doctorId;
        if (req.user?.role === 'DOCTOR') {
            const [doctorRows] = await pool.query(
                'SELECT id FROM doctors WHERE user_id = ? LIMIT 1',
                [req.user.id]
            );
            if (doctorRows.length === 0) {
                return res.status(403).json({ success: false, message: 'No doctor profile is linked to this account.' });
            }
            doctorId = doctorRows[0].id;
        } else {
            const [appointmentRows] = await pool.query(
                `SELECT doctor_id FROM appointments
                 WHERE patient_id = ? AND status IN ('SCHEDULED', 'RESCHEDULED')
                 ORDER BY appointment_date ASC, time_slot ASC LIMIT 1`,
                [patient_id]
            );
            if (appointmentRows.length === 0) {
                return res.status(400).json({ success: false, message: 'The patient has no scheduled consultation.' });
            }
            doctorId = appointmentRows[0].doctor_id;
        }

        const [appointmentRows] = await pool.query(
            "SELECT id FROM appointments WHERE patient_id = ? AND doctor_id = ? AND status IN ('SCHEDULED', 'RESCHEDULED') LIMIT 1",
            [patient_id, doctorId]
        );
        if (appointmentRows.length === 0) {
            return res.status(403).json({ success: false, message: 'This patient is not assigned to your scheduled consultations.' });
        }

        const [recResult] = await pool.query(
            `INSERT INTO medical_records (patient_id, doctor_id, visit_date, symptoms, diagnosis, treatment_plan, notes)
             VALUES (?, ?, NOW(), ?, ?, ?, ?)`,
            [patient_id, doctorId, symptoms || '', diagnosis, treatment_plan || '', JSON.stringify({ vitals, prescriptions })]
        );

        const recordId = recResult.insertId;

        // If prescriptions were added, insert into prescriptions table
        if (Array.isArray(prescriptions) && prescriptions.length > 0) {
            const [prescResult] = await pool.query(
                `INSERT INTO prescriptions (medical_record_id, patient_id, doctor_id, status)
                 VALUES (?, ?, ?, 'PENDING')`,
                [recordId, patient_id, doctorId]
            );

            for (const item of prescriptions) {
                if (item.medicine_id) {
                    await pool.query(
                        `INSERT INTO prescription_items (prescription_id, medicine_id, dosage, frequency, duration, instructions)
                         VALUES (?, ?, ?, ?, ?, ?)`,
                        [prescResult.insertId, item.medicine_id, item.dosage || '1 tablet', item.frequency || 'Twice daily', item.duration || '5 days', item.instructions || 'After meals']
                    );
                }
            }
        }

        await logAudit(req.user?.id, 'CREATE_EMR_RECORD', 'medical_records', recordId, `EMR consultation logged for patient ${patient_id}`, req);

        res.status(201).json({ success: true, message: 'Medical consultation recorded successfully.', recordId });
    } catch (error) {
        console.error('createMedicalRecord error:', error);
        res.status(500).json({ success: false, message: 'Failed to record medical consultation.' });
    }
};

// ==========================================
// Laboratory Desk
// ==========================================
export const getLabTests = async (req, res) => {
    try {
        const [tests] = await pool.query(`
            SELECT l.*, p.full_name AS patient_name, p.patient_code
            FROM lab_tests l
            JOIN patients p ON l.patient_id = p.id
            ORDER BY l.id DESC
        `);
        res.json({ success: true, tests });
    } catch (error) {
        console.error('getLabTests error:', error);
        res.status(500).json({ success: false, message: 'Failed to retrieve lab tests.' });
    }
};

export const createLabTest = async (req, res) => {
    try {
        const { patient_id, test_name, category, sample_type, normal_range, cost } = req.body;
        if (!patient_id || !test_name || !category) return res.status(400).json({ success: false, message: 'Patient, test name, and category are required.' });
        const testCode = `LAB-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
        const [result] = await pool.query(
            `INSERT INTO lab_tests (test_code, patient_id, test_name, category, sample_type, normal_range, cost)
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [testCode, patient_id, test_name, category, sample_type || 'Blood', normal_range || null, cost || 30]
        );
        await logAudit(req.user?.id, 'CREATE_LAB_TEST_REQUEST', 'lab_tests', result.insertId, `Created laboratory request ${testCode}`, req);
        res.status(201).json({ success: true, testId: result.insertId, test_code: testCode });
    } catch (error) {
        console.error('createLabTest error:', error);
        res.status(500).json({ success: false, message: 'Failed to create laboratory test request.' });
    }
};

export const updateLabSampleStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { sample_status } = req.body;

        await pool.query('UPDATE lab_tests SET sample_status = ? WHERE id = ?', [sample_status, id]);
        await logAudit(req.user?.id, 'UPDATE_LAB_SAMPLE', 'lab_tests', id, `Sample marked as ${sample_status}`, req);

        res.json({ success: true, message: `Sample status updated to ${sample_status}.` });
    } catch (error) {
        console.error('updateLabSampleStatus error:', error);
        res.status(500).json({ success: false, message: 'Failed to update sample status.' });
    }
};

export const updateLabResult = async (req, res) => {
    try {
        const { id } = req.params;
        const { results } = req.body;

        await pool.query(
            `UPDATE lab_tests
             SET results = ?, test_status = 'COMPLETED', completed_at = NOW()
             WHERE id = ?`,
            [results, id]
        );

        await logAudit(req.user?.id, 'ENTER_LAB_RESULT', 'lab_tests', id, `Test result completed`, req);

        res.json({ success: true, message: 'Laboratory results published successfully.' });
    } catch (error) {
        console.error('updateLabResult error:', error);
        res.status(500).json({ success: false, message: 'Failed to update lab results.' });
    }
};

// ==========================================
// Pharmacy & Medicine Inventory
// ==========================================
export const getMedicines = async (req, res) => {
    try {
        const [medicines] = await pool.query(`
            SELECT * FROM medicines ORDER BY stock_quantity ASC, name ASC
        `);
        res.json({ success: true, count: medicines.length, medicines });
    } catch (error) {
        console.error('getMedicines error:', error);
        res.status(500).json({ success: false, message: 'Failed to retrieve medicines.' });
    }
};

export const addMedicine = async (req, res) => {
    try {
        const { name, generic_name, category, stock_quantity, min_stock_alert, unit_price, batch_number, expiry_date } = req.body;

        const [result] = await pool.query(
            `INSERT INTO medicines (name, generic_name, category, stock_quantity, min_stock_alert, unit_price, batch_number, expiry_date)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [name, generic_name || '', category || 'General', stock_quantity || 0, min_stock_alert || 10, unit_price || 0.00, batch_number || 'BATCH-001', expiry_date || '2027-12-31']
        );

        await logAudit(req.user?.id, 'ADD_MEDICINE', 'medicines', result.insertId, `Added medicine ${name}`, req);

        res.status(201).json({ success: true, message: 'Medicine added successfully.', medicineId: result.insertId });
    } catch (error) {
        console.error('addMedicine error:', error);
        res.status(500).json({ success: false, message: 'Failed to add medicine.' });
    }
};

export const dispenseMedicine = async (req, res) => {
    try {
        const { id } = req.params; // medicine id
        const { quantity = 1 } = req.body;

        const [meds] = await pool.query('SELECT * FROM medicines WHERE id = ?', [id]);
        if (meds.length === 0) return res.status(404).json({ success: false, message: 'Medicine not found.' });

        const med = meds[0];
        if (med.stock_quantity < quantity) {
            return res.status(400).json({ success: false, message: `Insufficient stock! Only ${med.stock_quantity} units available.` });
        }

        const newStock = med.stock_quantity - quantity;
        await pool.query('UPDATE medicines SET stock_quantity = ? WHERE id = ?', [newStock, id]);

        await logAudit(req.user?.id, 'DISPENSE_MEDICINE', 'medicines', id, `Dispensed ${quantity} units of ${med.name}. Remaining: ${newStock}`, req);

        res.json({ success: true, message: `Dispensed ${quantity} units of ${med.name} successfully. Remaining stock: ${newStock}.`, remainingStock: newStock });
    } catch (error) {
        console.error('dispenseMedicine error:', error);
        res.status(500).json({ success: false, message: 'Failed to dispense medicine.' });
    }
};

export const getPrescriptionQueue = async (req, res) => {
    try {
        const [queue] = await pool.query(`
            SELECT pi.id, p.id AS prescription_id, pa.full_name AS patient_name, d.full_name AS doctor_name,
                   pi.medicine_id, m.name AS medicine_name, pi.dosage, pi.frequency, pi.duration,
                   1 AS quantity, p.status
            FROM prescriptions p
            JOIN prescription_items pi ON pi.prescription_id = p.id
            JOIN patients pa ON pa.id = p.patient_id
            JOIN doctors d ON d.id = p.doctor_id
            JOIN medicines m ON m.id = pi.medicine_id
            WHERE p.status = 'PENDING'
            ORDER BY p.id DESC, pi.id ASC`);
        res.json({ success: true, queue });
    } catch (error) {
        console.error('getPrescriptionQueue error:', error);
        res.status(500).json({ success: false, message: 'Failed to retrieve prescription queue.' });
    }
};

export const dispensePrescription = async (req, res) => {
    try {
        const { prescriptionId } = req.params;
        const [items] = await pool.query('SELECT medicine_id FROM prescription_items WHERE prescription_id = ?', [prescriptionId]);
        if (!items.length) return res.status(404).json({ success: false, message: 'Prescription not found.' });
        for (const item of items) {
            const [medicines] = await pool.query('SELECT stock_quantity, name FROM medicines WHERE id = ?', [item.medicine_id]);
            if (!medicines.length || medicines[0].stock_quantity < 1) return res.status(400).json({ success: false, message: `Insufficient stock for ${medicines[0]?.name || 'a prescribed medicine'}.` });
        }
        for (const item of items) await pool.query('UPDATE medicines SET stock_quantity = stock_quantity - 1 WHERE id = ?', [item.medicine_id]);
        await pool.query("UPDATE prescriptions SET status = 'DISPENSED' WHERE id = ?", [prescriptionId]);
        await logAudit(req.user?.id, 'DISPENSE_PRESCRIPTION', 'prescriptions', prescriptionId, 'Prescription dispensed', req);
        res.json({ success: true, message: 'Prescription dispensed.' });
    } catch (error) {
        console.error('dispensePrescription error:', error);
        res.status(500).json({ success: false, message: 'Failed to dispense prescription.' });
    }
};

export default {
    getConsultationPatients,
    getMedicalRecords,
    createMedicalRecord,
    createLabTest,
    getLabTests,
    updateLabSampleStatus,
    updateLabResult,
    getMedicines,
    addMedicine,
    dispenseMedicine,
    getPrescriptionQueue,
    dispensePrescription
};
