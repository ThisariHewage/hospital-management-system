/**
 * seedAdmin.js — Super Admin Seeder
 * ====================================
 * Run this script ONCE to insert/update the super admin user in the database.
 * Credentials are read from .env (ADMIN_USERNAME & ADMIN_PASSWORD).
 *
 * Usage (from project root):
 *   npm run db:seed-admin
 *
 * Or directly (from server/ folder):
 *   node src/utils/seedAdmin.js
 */

import bcrypt from 'bcryptjs';
import pool from '../config/db.js';

const ADMIN_USERNAME = process.env.ADMIN_USERNAME;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

async function seedAdmin() {
    console.log('\n🌱  Hospital Management System — Super Admin Seeder');
    console.log('====================================================');

    if (!ADMIN_USERNAME || !ADMIN_PASSWORD) {
        console.error('\n❌  ERROR: ADMIN_USERNAME and ADMIN_PASSWORD must be set in server/.env');
        process.exit(1);
    }

    try {
        // 1. Get admin role_id
        const [roles] = await pool.query("SELECT id FROM roles WHERE name = 'ADMIN' LIMIT 1");
        if (roles.length === 0) {
            console.error("❌  'ADMIN' role not found in roles table. Please run schema.sql and seed.sql first.");
            process.exit(1);
        }
        const adminRoleId = roles[0].id;

        // 2. Hash the admin password
        const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 12);

        // 3. Upsert the super admin user
        const adminEmail = `${ADMIN_USERNAME.toLowerCase()}@hospital.local`;
        await pool.query(
            `INSERT INTO users (username, email, password_hash, role_id, is_active)
             VALUES (?, ?, ?, ?, TRUE)
             ON DUPLICATE KEY UPDATE
                 password_hash = VALUES(password_hash),
                 email         = VALUES(email),
                 role_id       = VALUES(role_id),
                 is_active     = TRUE`,
            [ADMIN_USERNAME, adminEmail, passwordHash, adminRoleId]
        );

        const pad = (s, n) => String(s).padEnd(n);
        console.log('\n✅  Super admin seeded successfully!\n');
        console.log('  ┌─────────────────────────────────────────┐');
        console.log(`  │  Username : ${pad(ADMIN_USERNAME, 28)} │`);
        console.log(`  │  Password : ${pad(ADMIN_PASSWORD, 28)} │`);
        console.log(`  │  Role     : ${'ADMIN'.padEnd(28)} │`);
        console.log(`  │  Email    : ${pad(adminEmail, 28)} │`);
        console.log('  └─────────────────────────────────────────┘');
        console.log('\n⚠️   Keep your .env file secret and never commit it to Git.\n');

    } catch (err) {
        console.error('\n❌  Seeder failed:', err.message);
        process.exit(1);
    } finally {
        process.exit(0);
    }
}

seedAdmin();
