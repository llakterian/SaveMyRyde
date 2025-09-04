import { Router } from 'express';
import { getPool } from '../config/database';
import { adminVerifyPayment } from '../services/payments';

const router = Router();

// List pending manual payments
router.get('/pending', async (_req, res) => {
    try {
        const pool = getPool();
        const q = await pool.query(
            `SELECT id, user_id, listing_id, amount_kes, status, provider, provider_ref, created_at
       FROM payments WHERE status = 'initiated' AND provider = 'mpesa-manual'
       ORDER BY created_at DESC LIMIT 200`
        );
        return res.json(q.rows);
    } catch (e) {
        console.error(e);
        return res.status(500).json({ error: 'Failed to load pending payments' });
    }
});

// Search by M-Pesa code
router.get('/search', async (req, res) => {
    try {
        const code = String(req.query.code || '').trim();
        if (!code) return res.status(400).json({ error: 'code query param is required' });
        const pool = getPool();
        const q = await pool.query(
            `SELECT id, user_id, listing_id, amount_kes, status, provider, provider_ref, created_at
       FROM payments WHERE provider_ref = $1 LIMIT 1`,
            [code]
        );
        if (q.rowCount === 0) return res.status(404).json({ error: 'Not found' });
        return res.json(q.rows[0]);
    } catch (e) {
        console.error(e);
        return res.status(500).json({ error: 'Failed to search payment' });
    }
});

// Approve/Reject (delegates to service)
router.post('/manual/verify', adminVerifyPayment);

export default router;