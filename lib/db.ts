import mysql from 'mysql2/promise';

// Database connection configuration
export const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'svenn',
  port: parseInt(process.env.DB_PORT || '3306'),
};

// Create a connection pool
const pool = mysql.createPool(dbConfig);

export async function executeQuery<T>(query: string, params: any[] = []): Promise<T> {
  try {
    const [rows] = await pool.execute(query, params);
    return rows as T;
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
}

export default pool;
