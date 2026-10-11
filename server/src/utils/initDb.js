import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function initializeDatabase() {
    console.log('🔄 Initializing Hospital Management System Database...');

    const host = process.env.DB_HOST || 'localhost';
    const port = parseInt(process.env.DB_PORT || '3306', 10);
    const user = process.env.DB_USER || 'root';
    const password = process.env.DB_PASSWORD || '';
    const dbName = process.env.DB_NAME || 'hospital_db';

    let connection;
    try {
        // 1. Connect without database to ensure database exists
        connection = await mysql.createConnection({ host, port, user, password, multipleStatements: true });
        console.log(`Connected to MySQL server on ${host}:${port}`);

        await connection.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\`;`);
        await connection.query(`USE \`${dbName}\`;`);
        console.log(`Database '${dbName}' ready.`);

        // 2. Read and execute schema.sql
        const schemaPath = path.resolve(__dirname, '../../../database/schema.sql');
        if (fs.existsSync(schemaPath)) {
            const schemaSql = fs.readFileSync(schemaPath, 'utf8');
            await connection.query(schemaSql);
            console.log('✅ schema.sql executed successfully.');
        }

        // 3. Read and execute seed.sql
        const seedPath = path.resolve(__dirname, '../../../database/seed.sql');
        if (fs.existsSync(seedPath)) {
            const seedSql = fs.readFileSync(seedPath, 'utf8');
            await connection.query(seedSql);
            console.log('✅ seed.sql executed successfully.');
        }

        console.log('🎉 Database initialization complete!');
    } catch (error) {
        console.error('❌ Database initialization error:', error.message);
    } finally {
        if (connection) await connection.end();
    }
}

initializeDatabase();
