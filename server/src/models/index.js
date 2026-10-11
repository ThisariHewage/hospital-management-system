import pool from '../config/db.js';

// Database query helper
export const query = async (sql, params) => {
    const [results] = await pool.query(sql, params);
    return results;
};

export default { query };
