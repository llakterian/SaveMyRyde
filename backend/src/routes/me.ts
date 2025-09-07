import { Router } from 'express';
import { getPool } from '../config/database';
import { requireAuth } from '../middleware/auth';

const router = Router();

router.use(requireAuth);

// GET /api/me/profile - current user profile (role)
router.get('/profile', async (req, res) => {
    try {
        const { userId } = (req as any).user as { userId: string };
        const pool = getPool();
        const q = await pool.query(
            `SELECT id, email, phone, role, created_at FROM users WHERE id = $1 LIMIT 1`,
            [userId]
        );
        if (q.rowCount === 0) return res.status(404).json({ error: 'User not found' });
        return res.json(q.rows[0]);
    } catch (e) {
        console.error(e);
        return res.status(500).json({ error: 'Failed to load profile' });
    }
});

// POST /api/me/promote-to-seller - set role to seller
router.post('/promote-to-seller', async (req, res) => {
    try {
        const { userId } = (req as any).user as { userId: string };
        const pool = getPool();
        await pool.query(`UPDATE users SET role='seller' WHERE id=$1 AND role <> 'admin'`, [userId]);
        const q = await pool.query(`SELECT id, email, phone, role FROM users WHERE id=$1`, [userId]);
        return res.json({ message: 'Role updated', user: q.rows[0] });
    } catch (e) {
        console.error(e);
        return res.status(500).json({ error: 'Failed to promote user' });
    }
});

// GET /api/me/listings - current user's listings
router.get('/listings', async (req, res) => {
    try {
        const user = (req as any).user as { userId: string };
        const pool = getPool();
        const q = await pool.query(
            `SELECT id, title, status, price_kes, location, images, created_at, updated_at, expires_at
       FROM listings WHERE user_id = $1 ORDER BY created_at DESC LIMIT 200`,
            [user.userId]
        );
        return res.json(q.rows);
    } catch (e) {
        console.error(e);
        return res.status(500).json({ error: 'Failed to load listings' });
    }
});

// GET /api/me/payments - current user's payment claims/status
router.get('/payments', async (req, res) => {
    try {
        const user = (req as any).user as { userId: string };
        const pool = getPool();
        const q = await pool.query(
            `SELECT id, listing_id, amount_kes, status, provider, provider_ref, created_at
       FROM payments WHERE user_id = $1 ORDER BY created_at DESC LIMIT 200`,
            [user.userId]
        );
        return res.json(q.rows);
    } catch (e) {
        console.error(e);
        return res.status(500).json({ error: 'Failed to load payments' });
    }
});

// POST /api/me/listings/:id/extend - extend active listing by 30 days
router.post('/listings/:id/extend', async (req, res) => {
    try {
        const user = (req as any).user as { userId: string };
        const { id } = req.params;
        const pool = getPool();

        // Verify ownership and status
        const q = await pool.query(
            `SELECT id, status FROM listings WHERE id=$1 AND user_id=$2 LIMIT 1`,
            [id, user.userId]
        );
        if (q.rowCount === 0) return res.status(404).json({ error: 'Listing not found' });
        const listing = q.rows[0] as { status: string };
        if (listing.status !== 'active') return res.status(400).json({ error: 'Only active listings can be extended' });

        // Extend expiry
        await pool.query(
            `UPDATE listings
         SET expires_at = (GREATEST(COALESCE(expires_at, NOW()), NOW()) + INTERVAL '30 days'),
             updated_at = NOW()
       WHERE id=$1`,
            [id]
        );

        return res.json({ message: 'Listing extended by 30 days' });
    } catch (e) {
        console.error(e);
        return res.status(500).json({ error: 'Failed to extend listing' });
    }
});

export default router;