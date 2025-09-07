import { getPool } from '../config/database';
import bcrypt from 'bcryptjs';

export async function seedInitialAdmin() {
    const pool = getPool();
    const email = process.env.ADMIN_EMAIL || 'admin@carrescue.ke';
    const phone = process.env.ADMIN_PHONE || '+254700000000';
    const name = 'Owner Admin';
    const plain = process.env.ADMIN_PASSWORD || 'admin123';
    const password_hash = await bcrypt.hash(plain, 10);
    await pool.query(
        `INSERT INTO users (name, email, phone, role, password_hash)
     VALUES ($1, $2, $3, 'admin', $4)
     ON CONFLICT (email) DO UPDATE SET role='admin', password_hash = COALESCE(users.password_hash, EXCLUDED.password_hash)`,
        [name, email, phone, password_hash]
    );
}