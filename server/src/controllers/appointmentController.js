import pool from '../config/db.js';
import { logAudit } from '../middleware/auditLogger.js';

export const getAppointments = async (req, res) => {
    try {
        let { doctor_id, date, status } = req.query;

        // If the logged-in user is a DOCTOR, auto-scope to their own appointments
        if (req.user?.role === 'DOCTOR') {
            const [doctorRows] = await pool.query(
                'SELECT id FROM doctors WHERE user_id = ? LIMIT 1',
                [req.user.id]
            );
            if (doctorRows.length === 0) {
                return res.json({ success: true, count: 0, appointments: [] });
            }
            doctor_id = doctorRows[0].id; // override any client-supplied value
        }

        let query = `
            SELECT a.*, p.full_name AS patient_name, p.patient_code, p.phone AS patient_phone,
                   d.full_name AS doctor_name, dep.name AS department_name
            FROM appointments a
            JOIN patients p ON a.patient_id = p.id
            JOIN doctors d ON a.doctor_id = d.id
            LEFT JOIN departments dep ON d.department_id = dep.id
            WHERE 1=1
        `;
        const params = [];

        if (doctor_id) {
            query += ` AND a.doctor_id = ?`;
            params.push(doctor_id);
        }
        if (date) {
            query += ` AND a.appointment_date = ?`;
            params.push(date);
        }
        if (status) {
            query += ` AND a.status = ?`;
            params.push(status);
        }

        query += ` ORDER BY a.appointment_date DESC, a.time_slot ASC LIMIT 100`;
        const [appointments] = await pool.query(query, params);
        res.json({ success: true, count: appointments.length, appointments });
    } catch (error) {
        console.error('getAppointments error:', error);
        res.status(500).json({ success: false, message: 'Failed to retrieve appointments.' });
    }
};


export const getDoctors = async (req, res) => {
    try {
        const [doctors] = await pool.query(`
            SELECT d.*, dep.name AS department_name
            FROM doctors d
            LEFT JOIN departments dep ON d.department_id = dep.id
            ORDER BY d.full_name ASC
        `);
        res.json({ success: true, doctors });
    } catch (error) {
        console.error('getDoctors error:', error);
        res.status(500).json({ success: false, message: 'Failed to retrieve doctors.' });
    }
};

export const createAppointment = async (req, res) => {
    try {
        const { patient_id, doctor_id, appointment_date, time_slot, reason } = req.body;

        if (!patient_id || !doctor_id || !appointment_date || !time_slot) {
            return res.status(400).json({ success: false, message: 'Patient, doctor, date, and time slot are required.' });
        }

        const randomCode = Math.floor(1000 + Math.random() * 9000);
        const appointment_code = `APT-${randomCode}`;

        const [result] = await pool.query(
            `INSERT INTO appointments (appointment_code, patient_id, doctor_id, appointment_date, time_slot, reason, status)
             VALUES (?, ?, ?, ?, ?, ?, 'SCHEDULED')`,
            [appointment_code, patient_id, doctor_id, appointment_date, time_slot, reason || 'General Consultation']
        );

        await logAudit(req.user?.id, 'CREATE_APPOINTMENT', 'appointments', result.insertId, `Scheduled appointment ${appointment_code}`, req);

        res.status(201).json({
            success: true,
            message: 'Appointment booked successfully.',
            appointmentId: result.insertId,
            appointment_code
        });
    } catch (error) {
        console.error('createAppointment error:', error);
        res.status(500).json({ success: false, message: 'Failed to book appointment.' });
    }
};

export const updateAppointmentStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const { id } = req.params;

        if (!['SCHEDULED', 'COMPLETED', 'CANCELLED'].includes(status)) {
            return res.status(400).json({ success: false, message: 'Invalid status value.' });
        }

        await pool.query('UPDATE appointments SET status = ? WHERE id = ?', [status, id]);
        await logAudit(req.user?.id, 'UPDATE_APPOINTMENT_STATUS', 'appointments', id, `Status updated to ${status}`, req);

        res.json({ success: true, message: `Appointment status updated to ${status}.` });
    } catch (error) {
        console.error('updateAppointmentStatus error:', error);
        res.status(500).json({ success: false, message: 'Failed to update appointment status.' });
    }
};

export default { getAppointments, getDoctors, createAppointment, updateAppointmentStatus };
