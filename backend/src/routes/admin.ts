import { Router } from 'express';
import fs from 'fs';
import path from 'path';
import { getPool } from '../config/database';

const router = Router();

// Dev-only: initialize DB schema from SQL file
router.post('/init-db', async (req, res) => {
    try {
        const sqlPath = path.join(process.cwd(), 'backend', 'src', 'db', 'schema.sql');
        const sql = fs.readFileSync(sqlPath, 'utf-8');
        const pool = getPool();
        await pool.query(sql);
        return res.json({ message: 'Database initialized' });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Failed to initialize database' });
    }
});

// Admin: trigger expiry job
router.post('/expire-now', async (req, res) => {
    try {
        const { expireListingsJob } = await import('../jobs/expire');
        await expireListingsJob();
        return res.json({ message: 'Expiry job run completed' });
    } catch (e) {
        console.error(e);
        return res.status(500).json({ error: 'Failed to run expiry job' });
    }
});

export default router;