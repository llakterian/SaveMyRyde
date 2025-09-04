import { getPool } from '../config/database';

export async function seedInitialAdmin() {
    const pool = getPool();
    const email = 'triolinkl@gmail.com';
    const phone = '+254101355308';
    const name = 'Owner Admin';
    await pool.query(
        `INSERT INTO users (name, email, phone, role)
     VALUES ($1, $2, $3, 'admin')
     ON CONFLICT (email) DO UPDATE SET role='admin'`,
        [name, email, phone]
    );
}