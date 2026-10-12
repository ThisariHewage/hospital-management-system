-- ====================================================================
-- Hospital Management System (HMS) - Initial Seed Data
-- ====================================================================

USE hospital_db;

-- 1. Insert Roles
INSERT INTO roles (id, name, description) VALUES
(1, 'ADMIN', 'System Administrator with full access'),
(2, 'DOCTOR', 'Medical Doctor managing diagnoses, appointments and prescriptions'),
(3, 'NURSE', 'Nursing staff managing vitals, admissions and patient care'),
(4, 'RECEPTIONIST', 'Front-desk staff handling registration, appointments and inquiries'),
(5, 'LAB_STAFF', 'Laboratory technician handling samples, tests and reports'),
(6, 'PHARMACIST', 'Pharmacy staff managing inventory, stock and dispensing drugs'),
(7, 'ACCOUNTANT', 'Financial officer handling billing, payments and revenue reports')
ON DUPLICATE KEY UPDATE name=VALUES(name);

-- 2. Insert Users (Default password: password123, bcrypt hash: $2a$10$EdKu4JC5ufMO4x1XG83k6.cDztDQjqkpgBiGOS3ap/AqW3Xk5t1fK)
INSERT INTO users (id, username, email, password_hash, role_id, is_active) VALUES
(1, 'admin', 'admin@hospital.com', '$2a$10$EdKu4JC5ufMO4x1XG83k6.cDztDQjqkpgBiGOS3ap/AqW3Xk5t1fK', 1, TRUE),
(2, 'dr_smith', 'smith@hospital.com', '$2a$10$EdKu4JC5ufMO4x1XG83k6.cDztDQjqkpgBiGOS3ap/AqW3Xk5t1fK', 2, TRUE),
(3, 'dr_sarah', 'sarah@hospital.com', '$2a$10$EdKu4JC5ufMO4x1XG83k6.cDztDQjqkpgBiGOS3ap/AqW3Xk5t1fK', 2, TRUE),
(4, 'nurse_joy', 'joy@hospital.com', '$2a$10$EdKu4JC5ufMO4x1XG83k6.cDztDQjqkpgBiGOS3ap/AqW3Xk5t1fK', 3, TRUE),
(5, 'reception_alex', 'alex@hospital.com', '$2a$10$EdKu4JC5ufMO4x1XG83k6.cDztDQjqkpgBiGOS3ap/AqW3Xk5t1fK', 4, TRUE),
(6, 'lab_david', 'david@hospital.com', '$2a$10$EdKu4JC5ufMO4x1XG83k6.cDztDQjqkpgBiGOS3ap/AqW3Xk5t1fK', 5, TRUE),
(7, 'pharma_emma', 'emma@hospital.com', '$2a$10$EdKu4JC5ufMO4x1XG83k6.cDztDQjqkpgBiGOS3ap/AqW3Xk5t1fK', 6, TRUE),
(8, 'account_marcus', 'marcus@hospital.com', '$2a$10$EdKu4JC5ufMO4x1XG83k6.cDztDQjqkpgBiGOS3ap/AqW3Xk5t1fK', 7, TRUE)
ON DUPLICATE KEY UPDATE username=VALUES(username);

-- 3. Insert Departments
INSERT INTO departments (id, name, description, head_doctor) VALUES
(1, 'Cardiology', 'Heart health, cardiovascular surgery and diagnostics', 'Dr. Robert Smith'),
(2, 'Pediatrics', 'Children healthcare, vaccination and newborn care', 'Dr. Sarah Jenkins'),
(3, 'Neurology', 'Brain, spinal cord and nervous system disorders', 'Dr. Alan Vance'),
(4, 'Orthopedics', 'Musculoskeletal system, bone fractures and joint care', 'Dr. Michael Chang'),
(5, 'General Medicine', 'Primary care, routine physicals and adult medicine', 'Dr. Clara Oswald')
ON DUPLICATE KEY UPDATE name=VALUES(name);

-- 4. Insert Doctors
INSERT INTO doctors (id, user_id, department_id, full_name, specialization, phone, consultation_fee, schedule_days, schedule_time) VALUES
(1, 2, 1, 'Dr. Robert Smith', 'Cardiologist', '+1 555-0101', 75.00, 'Mon,Wed,Fri', '09:00 - 15:00'),
(2, 3, 2, 'Dr. Sarah Jenkins', 'Pediatrician', '+1 555-0102', 60.00, 'Tue,Thu,Sat', '10:00 - 16:00'),
(3, NULL, 4, 'Dr. Michael Chang', 'Orthopedic Surgeon', '+1 555-0103', 80.00, 'Mon,Tue,Wed', '08:30 - 14:30')
ON DUPLICATE KEY UPDATE full_name=VALUES(full_name);

-- 5. Insert Patients
INSERT INTO patients (id, patient_code, full_name, dob, gender, phone, email, address, blood_group, emergency_contact) VALUES
(1, 'PAT-2026-0001', 'James Wilson', '1985-04-12', 'Male', '+1 555-1001', 'jwilson@email.com', '742 Evergreen Terrace, Springfield', 'O+', 'Mary Wilson (+1 555-1002)'),
(2, 'PAT-2026-0002', 'Eleanor Rigby', '1992-09-25', 'Female', '+1 555-1003', 'erigby@email.com', '12 Abbey Road, London', 'A+', 'John Rigby (+1 555-1004)'),
(3, 'PAT-2026-0003', 'Liam Vance', '2015-02-18', 'Male', '+1 555-1005', 'lvance@email.com', '84 Baker St, Marylebone', 'B-', 'Grace Vance (+1 555-1006)'),
(4, 'PAT-2026-0004', 'Sophia Martinez', '1978-11-03', 'Female', '+1 555-1007', 'smartinez@email.com', '104 Sunset Blvd, Los Angeles', 'AB+', 'Carlos Martinez (+1 555-1008)')
ON DUPLICATE KEY UPDATE patient_code=VALUES(patient_code);

-- 6. Insert Appointments
INSERT INTO appointments (id, appointment_code, patient_id, doctor_id, appointment_date, time_slot, reason, status) VALUES
(1, 'APT-1001', 1, 1, CURDATE(), '09:30 AM', 'Routine cardiovascular follow-up', 'SCHEDULED'),
(2, 'APT-1002', 2, 2, CURDATE(), '10:45 AM', 'Chronic migraine evaluation', 'SCHEDULED'),
(3, 'APT-1003', 3, 2, CURDATE() + INTERVAL 1 DAY, '11:15 AM', 'Pediatric annual checkup', 'SCHEDULED'),
(4, 'APT-1004', 4, 3, CURDATE() - INTERVAL 1 DAY, '02:00 PM', 'Knee joint pain after sprain', 'COMPLETED')
ON DUPLICATE KEY UPDATE appointment_code=VALUES(appointment_code);

-- 7. Insert Medicines & Inventory
INSERT INTO medicines (id, name, generic_name, category, stock_quantity, min_stock_alert, unit_price, batch_number, expiry_date) VALUES
(1, 'Amoxicillin 500mg', 'Amoxicillin', 'Antibiotics', 140, 20, 12.50, 'AMX-2026A', '2027-06-30'),
(2, 'Paracetamol 650mg', 'Acetaminophen', 'Analgesics', 350, 50, 4.00, 'PCM-8841B', '2028-01-15'),
(3, 'Atorvastatin 20mg', 'Atorvastatin', 'Cardiovascular', 85, 20, 22.00, 'ATV-9011C', '2026-12-31'),
(4, 'Metformin 850mg', 'Metformin HCl', 'Antidiabetic', 12, 25, 8.75, 'MET-7721D', '2026-11-20'),
(5, 'Azithromycin 250mg', 'Azithromycin', 'Antibiotics', 60, 15, 18.00, 'AZI-4432E', '2027-03-10'),
(6, 'Ibuprofen 400mg', 'Ibuprofen', 'NSAID', 8, 30, 6.20, 'IBU-3121F', '2026-09-15')
ON DUPLICATE KEY UPDATE name=VALUES(name);

-- 8. Insert Lab Tests
INSERT INTO lab_tests (id, test_code, patient_id, test_name, category, sample_type, sample_status, test_status, results, normal_range, cost) VALUES
(1, 'LAB-5001', 1, 'Complete Blood Count (CBC)', 'Hematology', 'Blood', 'COLLECTED', 'COMPLETED', 'WBC: 7.2 (Normal), RBC: 4.8 (Normal), Platelets: 240k', '4.5 - 11.0 x10^3/uL', 35.00),
(2, 'LAB-5002', 1, 'Lipid Profile Panel', 'Biochemistry', 'Blood', 'COLLECTED', 'COMPLETED', 'Cholesterol: 195 mg/dL, HDL: 52, LDL: 110', '< 200 mg/dL', 45.00),
(3, 'LAB-5003', 2, 'Thyroid Stimulating Hormone (TSH)', 'Endocrinology', 'Blood', 'PENDING', 'REQUESTED', NULL, '0.4 - 4.0 mIU/L', 40.00),
(4, 'LAB-5004', 4, 'Knee Digital X-Ray', 'Radiology', 'Imaging', 'COLLECTED', 'COMPLETED', 'No bone fracture observed. Mild meniscus strain.', 'Normal joint space', 65.00)
ON DUPLICATE KEY UPDATE test_code=VALUES(test_code);

-- 9. Insert Bills & Items
INSERT INTO bills (id, invoice_number, patient_id, appointment_id, subtotal, discount, tax_rate, total_amount, paid_amount, status) VALUES
(1, 'INV-2026-0001', 4, 4, 145.00, 10.00, 5.00, 141.75, 141.75, 'PAID')
ON DUPLICATE KEY UPDATE invoice_number=VALUES(invoice_number);

INSERT INTO bill_items (id, bill_id, description, item_type, quantity, unit_price, total_price) VALUES
(1, 1, 'Orthopedic Consultation Fee', 'CONSULTATION', 1, 80.00, 80.00),
(2, 1, 'Knee Digital X-Ray', 'LAB', 1, 65.00, 65.00)
ON DUPLICATE KEY UPDATE description=VALUES(description);

INSERT INTO payments (id, receipt_number, bill_id, amount, payment_method, transaction_ref) VALUES
(1, 'REC-9001', 1, 141.75, 'CARD', 'TXN-VISA-884210')
ON DUPLICATE KEY UPDATE receipt_number=VALUES(receipt_number);

-- 10. Insert Employees
INSERT INTO employees (id, employee_code, user_id, department_id, full_name, role_title, phone, email, joining_date, salary) VALUES
(1, 'EMP-101', 4, 5, 'Nurse Joy Carter', 'Head Nurse', '+1 555-2001', 'joy@hospital.com', '2023-01-15', 4800.00),
(2, 'EMP-102', 5, 5, 'Alex Rivera', 'Chief Receptionist', '+1 555-2002', 'alex@hospital.com', '2023-04-10', 3600.00),
(3, 'EMP-103', 6, 5, 'David Chen', 'Senior Lab Technician', '+1 555-2003', 'david@hospital.com', '2022-09-01', 4500.00),
(4, 'EMP-104', 7, 5, 'Emma Watson', 'Chief Pharmacist', '+1 555-2004', 'emma@hospital.com', '2021-11-20', 5200.00),
(5, 'EMP-105', 8, 5, 'Marcus Brody', 'Financial Controller', '+1 555-2005', 'marcus@hospital.com', '2020-05-15', 5500.00)
ON DUPLICATE KEY UPDATE employee_code=VALUES(employee_code);

-- 11. Initial Audit Log
INSERT INTO audit_logs (id, user_id, action, entity, entity_id, ip_address, details) VALUES
(1, 1, 'SYSTEM_INIT', 'System', '0', '127.0.0.1', 'Initial database schema and seed data loaded successfully')
ON DUPLICATE KEY UPDATE action=VALUES(action);
