import { Router } from 'express';
import { getPool } from '../config/database';

const router = Router();

// Minimal Airtel Money manual claim: same as M-Pesa manual (no SDK), just record provider='airtel-manual'
router.post('/manual/claim', async (req, res) => {
    try {
        const { userId, listingId, airtelRef } = req.body as { userId: string; listingId: string; airtelRef: string };
        if (!userId || !listingId || !airtelRef) return res.status(400).json({ error: 'userId, listingId, airtelRef are required' });
        const pool = getPool();
        const amount_kes = 2500;
        const ins = await pool.query(
            `INSERT INTO payments (user_id, listing_id, amount_kes, status, provider, provider_ref, metadata)
       VALUES ($1, $2, $3, 'initiated', 'airtel-manual', $4, $5) RETURNING id`,
            [userId, listingId, amount_kes, airtelRef, JSON.stringify({ manual: true })]
        );
        return res.json({ message: 'Airtel claim submitted. Admin will verify.', paymentId: ins.rows[0].id });
    } catch (e) {
        console.error(e);
        return res.status(500).json({ error: 'Failed to submit Airtel claim' });
    }
});

export default router;