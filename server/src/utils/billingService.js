import pool from '../config/db.js';

/** Creates a separate, traceable invoice whenever a clinical service is recorded. */
export const createAutomaticInvoice = async (patientId, items, appointmentId = null) => {
    const validItems = items.filter(item => Number(item.unit_price) > 0);
    if (!validItems.length) return null;
    const subtotal = validItems.reduce((sum, item) => sum + Number(item.quantity || 1) * Number(item.unit_price), 0);
    const invoiceNumber = `INV-${new Date().getFullYear()}-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const [billResult] = await pool.query(
        `INSERT INTO bills (invoice_number, patient_id, appointment_id, subtotal, total_amount, paid_amount, status)
         VALUES (?, ?, ?, ?, ?, 0, 'UNPAID')`,
        [invoiceNumber, patientId, appointmentId, subtotal, subtotal]
    );
    for (const item of validItems) {
        const quantity = Number(item.quantity || 1);
        const unitPrice = Number(item.unit_price);
        await pool.query(
            `INSERT INTO bill_items (bill_id, description, item_type, quantity, unit_price, total_price)
             VALUES (?, ?, ?, ?, ?, ?)`,
            [billResult.insertId, item.description, item.item_type, quantity, unitPrice, quantity * unitPrice]
        );
    }
    return { billId: billResult.insertId, invoiceNumber };
};
