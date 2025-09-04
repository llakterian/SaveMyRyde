import { getPool } from '../config/database';

export async function expireListingsJob() {
    const pool = getPool();
    // Expire listings whose expires_at < now
    await pool.query(`UPDATE listings SET status='expired', updated_at=NOW() WHERE expires_at IS NOT NULL AND expires_at < NOW() AND status='active'`);
}