import { Router } from 'express';
import { getPool } from '../config/database';
import multer from 'multer';

const router = Router();

// Local disk storage (replace with S3 later)
const upload = multer({ dest: 'uploads/' });

router.post('/', upload.array('images', 6), async (req, res) => {
    try {
        const { userId, title, description, price_kes, location } = req.body;

        if (!userId || !title || !price_kes || !location) {
            return res.status(400).json({ error: 'userId, title, price_kes, location are required' });
        }

        const images = (req.files as Express.Multer.File[] | undefined)?.map(f => `/uploads/${f.filename}`) || [];
        const pool = getPool();

        const result = await pool.query(
            `INSERT INTO listings (user_id, contact_phone, title, description, price_kes, location, images, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, 'pending') RETURNING id`,
            [userId, userId, title, description || null, parseInt(price_kes, 10), location, images]
        );

        const listingId = result.rows[0].id as string;

        return res.status(201).json({
            listingId,
            message: 'Listing created. Complete payment to publish.'
        });
    } catch (err: any) {
        console.error(err);
        return res.status(500).json({ error: 'Failed to create listing' });
    }
});

router.get('/', async (req, res) => {
    try {
        const pool = getPool();
        const result = await pool.query(`SELECT id, title, price_kes, location, images, status, created_at FROM listings WHERE status = 'public' ORDER BY created_at DESC LIMIT 100`);
        return res.json(result.rows);
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Failed to fetch listings' });
    }
});

router.get('/:id', async (req, res) => {
    try {
        const pool = getPool();
        const result = await pool.query(`SELECT * FROM listings WHERE id = $1`, [req.params.id]);
        if (result.rowCount === 0) return res.status(404).json({ error: 'Not found' });
        return res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Failed to fetch listing' });
    }
});

export default router;