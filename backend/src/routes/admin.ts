import { Router } from 'express';
import fs from 'fs';
import path from 'path';
import { getPool } from '../config/database';
import { requireAuth, requireRole } from '../middleware/auth';
import { seedInitialAdmin } from '../admin/seed';

const router = Router();

// Dev-only: seed initial admin user (no auth for seeding)
router.post('/seed-admin', async (req, res) => {
    try {
        await seedInitialAdmin();
        return res.json({ message: 'Admin seeded successfully' });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Failed to seed admin' });
    }
});

// Protect all admin routes
router.use(requireAuth, requireRole('admin'));

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

// Admin: mark DealStar fee as paid for a buyer (by phone)
router.post('/dealstar/mark-paid', async (req, res) => {
    try {
        const { phone } = req.body as { phone?: string };
        if (!phone) return res.status(400).json({ error: 'phone is required' });
        const pool = getPool();
        await pool.query(`UPDATE users SET dealstar_paid=TRUE WHERE phone=$1`, [phone]);
        return res.json({ message: 'DealStar marked paid', phone });
    } catch (e) {
        console.error(e);
        return res.status(500).json({ error: 'Failed to mark DealStar as paid' });
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

// Admin: get all users with email info
router.get('/users', async (req, res) => {
    try {
        const pool = getPool();
        const result = await pool.query('SELECT id, name, email, phone, role FROM users ORDER BY created_at DESC');
        return res.json(result.rows);
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Failed to fetch users' });
    }
});

// Admin: get app status
router.get('/status', async (req, res) => {
    try {
        const pool = getPool();
        const userCount = await pool.query('SELECT COUNT(*) as count FROM users');
        const listingCount = await pool.query('SELECT COUNT(*) as count FROM listings');
        return res.json({
            message: 'App is running',
            users: userCount.rows[0].count,
            listings: listingCount.rows[0].count
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Failed to fetch status' });
    }
});

// Admin: seed sample active listing
router.post('/seed-listing', async (req, res) => {
    try {
        const pool = getPool();
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 30); // Expires in 30 days

        const result = await pool.query(`
            INSERT INTO listings (
                user_id,
                contact_phone,
                title,
                description,
                price_kes,
                location,
                county,
                town,
                status,
                expires_at,
                verification_status
            ) VALUES (
                '0700000000',
                '0700000000',
                'Sample Toyota Corolla 2015',
                'Well maintained Toyota Corolla 2015 model, low mileage, accident free.',
                850000,
                'Nairobi CBD',
                'Nairobi',
                'Nairobi',
                'active',
                $1,
                'verified'
            ) RETURNING id
        `, [expiresAt]);

        return res.json({
            message: 'Sample listing seeded successfully',
            listing_id: result.rows[0].id
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Failed to seed sample listing' });
    }
});

export default router;
