import pool from '../config/db.js';
import { logAudit } from '../middleware/auditLogger.js';
import { runBackup } from '../utils/backup.js';

// ==========================================
// Staff & Attendance
// ==========================================
export const getStaff = async (req, res) => {
    try {
        const [staff] = await pool.query(`
            SELECT e.*, d.name AS department_name
            FROM employees e
            LEFT JOIN departments d ON e.department_id = d.id
            ORDER BY e.id ASC
        `);
        res.json({ success: true, count: staff.length, staff });
    } catch (error) {
        console.error('getStaff error:', error);
        res.status(500).json({ success: false, message: 'Failed to retrieve staff members.' });
    }
};

export const createStaff = async (req, res) => {
    try {
        const { full_name, role_title, department_id, phone, email, salary } = req.body;
        const employee_code = `EMP-${Math.floor(100 + Math.random() * 900)}`;

        const [result] = await pool.query(
            `INSERT INTO employees (employee_code, department_id, full_name, role_title, phone, email, joining_date, salary)
             VALUES (?, ?, ?, ?, ?, ?, CURDATE(), ?)`,
            [employee_code, department_id || 1, full_name, role_title, phone, email, salary || 3500.00]
        );

        await logAudit(req.user?.id, 'ADD_EMPLOYEE', 'employees', result.insertId, `Added employee ${full_name} (${employee_code})`, req);

        res.status(201).json({ success: true, message: 'Staff member added successfully.', employeeId: result.insertId, employee_code });
    } catch (error) {
        console.error('createStaff error:', error);
        res.status(500).json({ success: false, message: 'Failed to add staff member.' });
    }
};

export const getAttendance = async (req, res) => {
    try {
        const [records] = await pool.query(`
            SELECT a.*, e.full_name, e.employee_code, e.role_title
            FROM attendance a
            JOIN employees e ON a.employee_id = e.id
            WHERE a.date = CURDATE()
            ORDER BY a.id DESC
        `);
        res.json({ success: true, records });
    } catch (error) {
        console.error('getAttendance error:', error);
        res.status(500).json({ success: false, message: 'Failed to retrieve attendance.' });
    }
};

export const markAttendance = async (req, res) => {
    try {
        const { employee_id, status = 'PRESENT' } = req.body;

        const [existing] = await pool.query(
            'SELECT * FROM attendance WHERE employee_id = ? AND date = CURDATE()',
            [employee_id]
        );

        if (existing.length > 0) {
            // Update clock out
            await pool.query(
                'UPDATE attendance SET clock_out = CURTIME(), status = ? WHERE id = ?',
                [status, existing[0].id]
            );
            return res.json({ success: true, message: 'Clock-out recorded successfully.' });
        } else {
            // Clock in
            await pool.query(
                `INSERT INTO attendance (employee_id, date, status, clock_in)
                 VALUES (?, CURDATE(), ?, CURTIME())`,
                [employee_id, status]
            );
            return res.json({ success: true, message: 'Clock-in recorded successfully.' });
        }
    } catch (error) {
        console.error('markAttendance error:', error);
        res.status(500).json({ success: false, message: 'Failed to record attendance.' });
    }
};

// ==========================================
// Reports & Analytics Summary
// ==========================================
export const getReportsSummary = async (req, res) => {
    try {
        const [totalPatients] = await pool.query('SELECT COUNT(*) AS count FROM patients');
        const [todayAppointments] = await pool.query('SELECT COUNT(*) AS count FROM appointments WHERE appointment_date = CURDATE()');
        const [totalRevenue] = await pool.query('SELECT COALESCE(SUM(paid_amount), 0) AS total FROM bills');
        const [pendingRevenue] = await pool.query('SELECT COALESCE(SUM(total_amount - paid_amount), 0) AS pending FROM bills');
        const [medicineCount] = await pool.query('SELECT COUNT(*) AS total_items, COALESCE(SUM(stock_quantity * unit_price), 0) AS stock_value FROM medicines');
        const [lowStockMeds] = await pool.query('SELECT COUNT(*) AS count FROM medicines WHERE stock_quantity <= min_stock_alert');
        const [admissionsCount] = await pool.query('SELECT COUNT(*) AS count FROM admissions WHERE status = "ADMITTED"');
        const [recentBills] = await pool.query('SELECT invoice_number, total_amount, paid_amount, status, created_at FROM bills ORDER BY id DESC LIMIT 10');

        res.json({
            success: true,
            summary: {
                totalPatients: totalPatients[0].count,
                todayAppointments: todayAppointments[0].count,
                totalRevenue: parseFloat(totalRevenue[0].total),
                pendingRevenue: parseFloat(pendingRevenue[0].pending),
                totalMedicines: medicineCount[0].total_items,
                medicineStockValue: parseFloat(medicineCount[0].stock_value),
                lowStockCount: lowStockMeds[0].count,
                activeAdmissions: admissionsCount[0].count
            },
            recentBills
        });
    } catch (error) {
        console.error('getReportsSummary error:', error);
        res.status(500).json({ success: false, message: 'Failed to generate reports summary.' });
    }
};

// ==========================================
// System Backup Trigger
// ==========================================
export const triggerBackup = async (req, res) => {
    try {
        const result = await runBackup();
        await logAudit(req.user?.id, 'SYSTEM_BACKUP', 'system', 0, `Database backup created: ${result.filename}`, req);
        res.json({ success: true, message: 'System snapshot created successfully.', backup: result });
    } catch (error) {
        console.error('triggerBackup error:', error);
        res.status(500).json({ success: false, message: 'Backup generation failed.' });
    }
};

export default {
    getStaff,
    createStaff,
    getAttendance,
    markAttendance,
    getReportsSummary,
    triggerBackup
};
