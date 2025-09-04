import { Router } from 'express';
import { getPool } from '../config/database';
import multer from 'multer';
import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { randomUUID } from 'crypto';

const router = Router();

// Memory storage for processing + custom validation
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 4 * 1024 * 1024, files: 6 }, // 4MB per file, max 6
    fileFilter: (_req, file, cb) => {
        const allowed = ['image/jpeg', 'image/png', 'image/webp'];
        if (!allowed.includes(file.mimetype)) {
            return cb(new Error('Only JPEG/PNG/WEBP images are allowed'));
        }
        cb(null, true);
    },
});

async function ensureUploadsDir() {
    const dir = path.join(process.cwd(), 'uploads');
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    return dir;
}

router.post('/', upload.array('images', 6), async (req, res) => {
    try {
        const { userId, title, description, price_kes, location, county, town, seller_id_number, kra_pin } = req.body as any;

        if (!userId || !title || !price_kes || (!location && !(county && town))) {
            return res.status(400).json({ error: 'userId, title, price_kes and location/county+town are required' });
        }

        const uploadsDir = await ensureUploadsDir();
        const files = (req.files as Express.Multer.File[] | undefined) || [];

        // Compress and persist images
        const images: string[] = [];
        for (const file of files) {
            const outName = `${randomUUID()}.webp`;
            const outPath = path.join(uploadsDir, outName);
            await sharp(file.buffer)
                .rotate() // auto-orient
                .resize(1600, 1600, { fit: 'inside', withoutEnlargement: true })
                .webp({ quality: 80 })
                .toFile(outPath);
            images.push(`/uploads/${outName}`);
        }

        const pool = getPool();
        const loc = location || `${town}, ${county}`;

        // Insert listing (county/town columns exist; optional here)
        const result = await pool.query(
            `INSERT INTO listings (user_id, contact_phone, title, description, price_kes, location, images, status, expires_at, county, town)
             VALUES ($1, $2, $3, $4, $5, $6, $7, 'pending_payment', NOW() + INTERVAL '30 days', $8, $9)
             RETURNING id`,
            [userId, userId, title, description || null, parseInt(String(price_kes), 10), loc, images, county || null, town || null]
        );

        const listingId = result.rows[0].id as string;

        // Optionally upsert seller ID/KRA to users by phone
        if (seller_id_number || kra_pin) {
            try {
                if (seller_id_number) {
                    await pool.query(`UPDATE users SET seller_id_number=$1 WHERE phone=$2`, [seller_id_number, userId]);
                }
                if (kra_pin) {
                    await pool.query(`UPDATE users SET kra_pin=$1 WHERE phone=$2`, [kra_pin, userId]);
                }
            } catch (e) {
                console.warn('Failed to save seller/KRA info:', e);
            }
        }

        // Auto-promote buyer to seller on first listing (by phone)
        try {
            await pool.query(`UPDATE users SET role='seller' WHERE phone=$1 AND role='buyer'`, [userId]);
        } catch { }

        return res.status(201).json({
            listingId,
            message: 'Listing created. Pay KES 2,500 to publish.'
        });
    } catch (err: any) {
        console.error(err);
        return res.status(500).json({ error: err?.message || 'Failed to create listing' });
    }
});

router.get('/', async (req, res) => {
    try {
        const pool = getPool();
        const result = await pool.query(`SELECT id, title, price_kes, location, images, status, created_at FROM listings WHERE status = 'active' ORDER BY created_at DESC LIMIT 100`);
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