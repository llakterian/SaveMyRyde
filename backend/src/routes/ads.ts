import { Router } from 'express';
import { getPool } from '../config/database';

const router = Router();

const AD_PRICING: Record<string, number> = {
    featured: 500,
    homepage: 1500,
    boost: 800,
};

router.post('/boost', async (req, res) => {
    try {
        const { userId, listingId, type = 'featured', days = 7 } = req.body as {
            userId: string;
            listingId: string;
            type: 'featured' | 'homepage' | 'boost';
            days?: number;
        };

        if (!userId || !listingId) return res.status(400).json({ error: 'userId and listingId are required' });
        if (!AD_PRICING[type]) return res.status(400).json({ error: 'Invalid ad type' });

        const pool = getPool();

        // Ensure listing is public before boosting
        const listingQ = await pool.query(`SELECT status FROM listings WHERE id = $1`, [listingId]);
        if (listingQ.rowCount === 0) return res.status(404).json({ error: 'Listing not found' });
        if (listingQ.rows[0].status !== 'public') return res.status(400).json({ error: 'Listing must be public before advertising' });

        const amount_kes = AD_PRICING[type];

        // Create payment record (simulated success)
        const pay = await pool.query(
            `INSERT INTO payments (user_id, listing_id, amount_kes, status, provider, metadata)
       VALUES ($1, $2, $3, 'successful', 'mpesa', $4) RETURNING id` ,
            [userId, listingId, amount_kes, JSON.stringify({ adType: type, simulated: true })]
        );

        // Create ad window
        const ad = await pool.query(
            `INSERT INTO ads (listing_id, type, start_date, end_date, amount_kes)
       VALUES ($1, $2, CURRENT_DATE, CURRENT_DATE + ($3 || ' days')::interval, $4)
       RETURNING id` ,
            [listingId, type, days, amount_kes]
        );

        return res.json({ message: 'Ad purchased successfully', paymentId: pay.rows[0].id, adId: ad.rows[0].id, amount_kes });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Failed to purchase ad' });
    }
});

export default router;