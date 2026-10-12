import pool from '../config/db.js';
import { logAudit } from '../middleware/auditLogger.js';

export const getBills = async (req, res) => {
    try {
        const [bills] = await pool.query(`
            SELECT b.*, p.full_name AS patient_name, p.patient_code, p.phone AS patient_phone
            FROM bills b
            JOIN patients p ON b.patient_id = p.id
            ORDER BY b.id DESC
        `);
        res.json({ success: true, count: bills.length, bills });
    } catch (error) {
        console.error('getBills error:', error);
        res.status(500).json({ success: false, message: 'Failed to retrieve bills.' });
    }
};

export const getBillById = async (req, res) => {
    try {
        const { id } = req.params;
        const [bills] = await pool.query(`
            SELECT b.*, p.full_name AS patient_name, p.patient_code, p.phone AS patient_phone,
                   p.email AS patient_email, p.address AS patient_address
            FROM bills b
            JOIN patients p ON b.patient_id = p.id
            WHERE b.id = ?
        `, [id]);

        if (bills.length === 0) return res.status(404).json({ success: false, message: 'Invoice not found.' });

        const [items] = await pool.query('SELECT * FROM bill_items WHERE bill_id = ?', [id]);
        const [payments] = await pool.query('SELECT * FROM payments WHERE bill_id = ? ORDER BY id DESC', [id]);

        res.json({ success: true, bill: bills[0], items, payments });
    } catch (error) {
        console.error('getBillById error:', error);
        res.status(500).json({ success: false, message: 'Failed to retrieve invoice details.' });
    }
};

export const createBill = async (req, res) => {
    try {
        const { patient_id, appointment_id, items, discount = 0, tax_rate = 5 } = req.body;

        if (!patient_id || !Array.isArray(items) || items.length === 0) {
            return res.status(400).json({ success: false, message: 'Patient and at least one bill item are required.' });
        }

        // Calculate subtotal
        const subtotal = items.reduce((sum, item) => sum + (Number(item.quantity || 1) * Number(item.unit_price || 0)), 0);
        const taxAmount = ((subtotal - Number(discount)) * Number(tax_rate)) / 100;
        const totalAmount = Math.max(0, (subtotal - Number(discount)) + taxAmount);

        const year = new Date().getFullYear();
        const randNum = Math.floor(1000 + Math.random() * 9000);
        const invoice_number = `INV-${year}-${randNum}`;

        const [billRes] = await pool.query(
            `INSERT INTO bills (invoice_number, patient_id, appointment_id, subtotal, discount, tax_rate, total_amount, paid_amount, status)
             VALUES (?, ?, ?, ?, ?, ?, ?, 0.00, 'UNPAID')`,
            [invoice_number, patient_id, appointment_id || null, subtotal, discount, tax_rate, totalAmount]
        );

        const billId = billRes.insertId;

        for (const item of items) {
            const itemTotal = Number(item.quantity || 1) * Number(item.unit_price || 0);
            await pool.query(
                `INSERT INTO bill_items (bill_id, description, item_type, quantity, unit_price, total_price)
                 VALUES (?, ?, ?, ?, ?, ?)`,
                [billId, item.description, item.item_type || 'SERVICE', item.quantity || 1, item.unit_price, itemTotal]
            );
        }

        await logAudit(req.user?.id, 'CREATE_INVOICE', 'bills', billId, `Created invoice ${invoice_number} for $${totalAmount.toFixed(2)}`, req);

        res.status(201).json({ success: true, message: 'Invoice created successfully.', billId, invoice_number });
    } catch (error) {
        console.error('createBill error:', error);
        res.status(500).json({ success: false, message: 'Failed to create invoice.' });
    }
};

export const recordPayment = async (req, res) => {
    try {
        const { id } = req.params; // bill id
        const { amount, payment_method = 'CASH', transaction_ref } = req.body;

        const [bills] = await pool.query('SELECT * FROM bills WHERE id = ?', [id]);
        if (bills.length === 0) return res.status(404).json({ success: false, message: 'Invoice not found.' });

        const bill = bills[0];
        const newPaidAmount = Number(bill.paid_amount) + Number(amount);
        let newStatus = 'PARTIAL';
        if (newPaidAmount >= Number(bill.total_amount)) {
            newStatus = 'PAID';
        }

        const receiptNum = `REC-${Math.floor(1000 + Math.random() * 9000)}`;

        await pool.query(
            `INSERT INTO payments (receipt_number, bill_id, amount, payment_method, transaction_ref)
             VALUES (?, ?, ?, ?, ?)`,
            [receiptNum, id, amount, payment_method, transaction_ref || `TXN-${receiptNum}`]
        );

        await pool.query('UPDATE bills SET paid_amount = ?, status = ? WHERE id = ?', [newPaidAmount, newStatus, id]);

        await logAudit(req.user?.id, 'RECORD_PAYMENT', 'payments', id, `Recorded payment $${amount} for bill #${id} (${newStatus})`, req);

        res.json({ success: true, message: `Payment of $${amount} recorded successfully. Status: ${newStatus}`, receiptNum, newStatus });
    } catch (error) {
        console.error('recordPayment error:', error);
        res.status(500).json({ success: false, message: 'Failed to record payment.' });
    }
};

export default { getBills, getBillById, createBill, recordPayment };
