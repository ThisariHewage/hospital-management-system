-- ====================================================================
-- Hospital Management System (HMS) - Database Schema
-- Compatible with MySQL 5.7+ / MySQL 8.0+ and MySQL Workbench / XAMPP
-- ====================================================================

CREATE DATABASE IF NOT EXISTS hospital_db;
USE hospital_db;

-- 1. Roles Table
CREATE TABLE IF NOT EXISTS roles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    description VARCHAR(255) NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 2. Users Table (Authentication & Accounts)
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(100) NOT NULL UNIQUE,
    email VARCHAR(150) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role_id INT NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 3. Departments Table
CREATE TABLE IF NOT EXISTS departments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT NULL,
    head_doctor VARCHAR(150) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 4. Doctors Table
CREATE TABLE IF NOT EXISTS doctors (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT UNIQUE NULL,
    department_id INT NOT NULL,
    full_name VARCHAR(150) NOT NULL,
    specialization VARCHAR(150) NOT NULL,
    phone VARCHAR(30) NOT NULL,
    consultation_fee DECIMAL(10, 2) DEFAULT 50.00,
    schedule_days VARCHAR(100) DEFAULT 'Mon,Tue,Wed,Thu,Fri',
    schedule_time VARCHAR(100) DEFAULT '09:00 - 17:00',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 5. Patients Table
CREATE TABLE IF NOT EXISTS patients (
    id INT AUTO_INCREMENT PRIMARY KEY,
    patient_code VARCHAR(50) NOT NULL UNIQUE,
    full_name VARCHAR(150) NOT NULL,
    dob DATE NOT NULL,
    gender ENUM('Male', 'Female', 'Other') NOT NULL,
    phone VARCHAR(30) NOT NULL,
    email VARCHAR(150) NULL,
    address TEXT NULL,
    blood_group VARCHAR(10) NULL,
    emergency_contact VARCHAR(100) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 6. Patient Documents Table
CREATE TABLE IF NOT EXISTS patient_documents (
    id INT AUTO_INCREMENT PRIMARY KEY,
    patient_id INT NOT NULL,
    title VARCHAR(200) NOT NULL,
    file_url VARCHAR(500) NOT NULL,
    file_type VARCHAR(50) DEFAULT 'document',
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 7. Appointments Table
CREATE TABLE IF NOT EXISTS appointments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    appointment_code VARCHAR(50) NOT NULL UNIQUE,
    patient_id INT NOT NULL,
    doctor_id INT NOT NULL,
    appointment_date DATE NOT NULL,
    time_slot VARCHAR(50) NOT NULL,
    reason TEXT NULL,
    status ENUM('SCHEDULED', 'COMPLETED', 'CANCELLED', 'RESCHEDULED') DEFAULT 'SCHEDULED',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE,
    FOREIGN KEY (doctor_id) REFERENCES doctors(id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 8. Inpatient Admissions Table
CREATE TABLE IF NOT EXISTS admissions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    admission_code VARCHAR(50) NOT NULL UNIQUE,
    patient_id INT NOT NULL,
    department_id INT NOT NULL,
    bed_number VARCHAR(50) NOT NULL,
    room_type ENUM('General', 'Semi-Private', 'Private', 'ICU') DEFAULT 'General',
    admit_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    discharge_date TIMESTAMP NULL,
    status ENUM('ADMITTED', 'DISCHARGED') DEFAULT 'ADMITTED',
    daily_rate DECIMAL(10, 2) DEFAULT 100.00,
    diagnosis TEXT NULL,
    FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE,
    FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 9. Electronic Medical Records (EMR) Table
CREATE TABLE IF NOT EXISTS medical_records (
    id INT AUTO_INCREMENT PRIMARY KEY,
    patient_id INT NOT NULL,
    doctor_id INT NOT NULL,
    visit_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    symptoms TEXT NOT NULL,
    diagnosis TEXT NOT NULL,
    treatment_plan TEXT NULL,
    notes TEXT NULL,
    FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE,
    FOREIGN KEY (doctor_id) REFERENCES doctors(id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 10. Medicines & Pharmacy Inventory Table
CREATE TABLE IF NOT EXISTS medicines (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    generic_name VARCHAR(150) NULL,
    category VARCHAR(100) NOT NULL,
    stock_quantity INT NOT NULL DEFAULT 0,
    min_stock_alert INT NOT NULL DEFAULT 20,
    unit_price DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    batch_number VARCHAR(100) NOT NULL,
    expiry_date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 11. Prescriptions Table
CREATE TABLE IF NOT EXISTS prescriptions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    medical_record_id INT NOT NULL,
    medicine_id INT NOT NULL,
    dosage VARCHAR(100) NOT NULL,
    frequency VARCHAR(100) NOT NULL,
    duration VARCHAR(100) NOT NULL,
    instructions TEXT NULL,
    status ENUM('PENDING', 'DISPENSED') DEFAULT 'PENDING',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (medical_record_id) REFERENCES medical_records(id) ON DELETE CASCADE,
    FOREIGN KEY (medicine_id) REFERENCES medicines(id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 12. Laboratory Tests Table
CREATE TABLE IF NOT EXISTS lab_tests (
    id INT AUTO_INCREMENT PRIMARY KEY,
    test_code VARCHAR(50) NOT NULL UNIQUE,
    patient_id INT NOT NULL,
    test_name VARCHAR(150) NOT NULL,
    category VARCHAR(100) NOT NULL,
    sample_type VARCHAR(100) NULL,
    sample_status ENUM('PENDING', 'COLLECTED') DEFAULT 'PENDING',
    test_status ENUM('REQUESTED', 'IN_PROGRESS', 'COMPLETED') DEFAULT 'REQUESTED',
    results TEXT NULL,
    normal_range VARCHAR(100) NULL,
    cost DECIMAL(10, 2) DEFAULT 30.00,
    requested_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP NULL,
    FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 13. Billing & Invoices Table
CREATE TABLE IF NOT EXISTS bills (
    id INT AUTO_INCREMENT PRIMARY KEY,
    invoice_number VARCHAR(50) NOT NULL UNIQUE,
    patient_id INT NOT NULL,
    appointment_id INT NULL,
    subtotal DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    discount DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    tax_rate DECIMAL(5, 2) NOT NULL DEFAULT 0.00,
    total_amount DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    paid_amount DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    status ENUM('UNPAID', 'PARTIAL', 'PAID') DEFAULT 'UNPAID',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE,
    FOREIGN KEY (appointment_id) REFERENCES appointments(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 14. Bill Line Items Table
CREATE TABLE IF NOT EXISTS bill_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    bill_id INT NOT NULL,
    description VARCHAR(255) NOT NULL,
    item_type ENUM('CONSULTATION', 'LAB', 'PHARMACY', 'ADMISSION', 'MISC') NOT NULL,
    quantity INT NOT NULL DEFAULT 1,
    unit_price DECIMAL(10, 2) NOT NULL,
    total_price DECIMAL(10, 2) NOT NULL,
    FOREIGN KEY (bill_id) REFERENCES bills(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 15. Payments Table
CREATE TABLE IF NOT EXISTS payments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    receipt_number VARCHAR(50) NOT NULL UNIQUE,
    bill_id INT NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    payment_method ENUM('CASH', 'CARD', 'ONLINE', 'INSURANCE') DEFAULT 'CASH',
    transaction_ref VARCHAR(100) NULL,
    received_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (bill_id) REFERENCES bills(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 16. Employees & Staff Table
CREATE TABLE IF NOT EXISTS employees (
    id INT AUTO_INCREMENT PRIMARY KEY,
    employee_code VARCHAR(50) NOT NULL UNIQUE,
    user_id INT UNIQUE NULL,
    department_id INT NOT NULL,
    full_name VARCHAR(150) NOT NULL,
    role_title VARCHAR(100) NOT NULL,
    phone VARCHAR(30) NOT NULL,
    email VARCHAR(150) NOT NULL,
    joining_date DATE NOT NULL,
    salary DECIMAL(10, 2) NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 17. Attendance Table
CREATE TABLE IF NOT EXISTS attendances (
    id INT AUTO_INCREMENT PRIMARY KEY,
    employee_id INT NOT NULL,
    date DATE NOT NULL,
    status ENUM('PRESENT', 'ABSENT', 'HALF_DAY', 'ON_LEAVE') DEFAULT 'PRESENT',
    check_in VARCHAR(20) NULL,
    check_out VARCHAR(20) NULL,
    FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 18. Leave Records Table
CREATE TABLE IF NOT EXISTS leave_records (
    id INT AUTO_INCREMENT PRIMARY KEY,
    employee_id INT NOT NULL,
    leave_type ENUM('SICK', 'CASUAL', 'ANNUAL', 'MATERNITY') NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    reason TEXT NULL,
    status ENUM('PENDING', 'APPROVED', 'REJECTED') DEFAULT 'PENDING',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 19. Audit Logs Table
CREATE TABLE IF NOT EXISTS audit_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NULL,
    action VARCHAR(100) NOT NULL,
    entity VARCHAR(100) NOT NULL,
    entity_id VARCHAR(100) NULL,
    ip_address VARCHAR(50) NULL,
    details TEXT NULL,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
