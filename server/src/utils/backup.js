import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pool from '../config/db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const performBackup = async () => {
    const backupDir = path.resolve(__dirname, '../../../backups');
    if (!fs.existsSync(backupDir)) {
        fs.mkdirSync(backupDir, { recursive: true });
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupFileName = `backup_hospital_db_${timestamp}.json`;
    const backupFilePath = path.join(backupDir, backupFileName);

    try {
        const [tables] = await pool.query('SHOW TABLES');
        const backupData = { timestamp: new Date().toISOString(), tables: {} };

        for (const row of tables) {
            const tableName = Object.values(row)[0];
            const [rows] = await pool.query(`SELECT * FROM \`${tableName}\``);
            backupData.tables[tableName] = rows;
        }

        fs.writeFileSync(backupFilePath, JSON.stringify(backupData, null, 2));
        console.log(`✅ Backup created successfully: ${backupFileName}`);
        return { success: true, fileName: backupFileName, path: backupFilePath };
    } catch (error) {
        console.error('Backup creation error:', error.message);
        throw error;
    }
};

export const runBackup = performBackup;

