import { Router } from 'express';
import { getPool } from '../config/database';
import multer from 'multer';
import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { requireAuth } from '../middleware/auth';
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
        const { userId, title, description, price_kes, location, county, town, seller_id_number, kra_pin, min_price_kes, auction_deadline, is_flash_deal } = req.body as any;

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

        // Insert listing with new fields
        const result = await pool.query(
            `INSERT INTO listings (
                user_id, contact_phone, title, description, price_kes, location, images, status, expires_at, county, town,
                min_price_kes, auction_deadline, is_flash_deal
             )
             VALUES (
                $1, $2, $3, $4, $5, $6, $7, 'pending_payment', NOW() + INTERVAL '30 days', $8, $9,
                $10, $11, $12
             )
             RETURNING id`,
            [
                userId, userId, title, description || null, parseInt(String(price_kes), 10), loc, images, county || null, town || null,
                min_price_kes ? parseInt(String(min_price_kes), 10) : null,
                auction_deadline || null,
                String(is_flash_deal) === 'true'
            ]
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
            message: 'Listing created. Pay KES 5,000 (RideSafe Pass) to publish.'
        });
    } catch (err: any) {
        console.error(err);
        return res.status(500).json({ error: err?.message || 'Failed to create listing' });
    }
});

router.get('/', async (req, res) => {
    try {
        const pool = getPool();
        const { make, model, year, min_price, max_price, location, county, town, flash } = req.query as any;
        // Basic filters mapped to existing columns; make/model/year are placeholders for future extension
        const clauses: string[] = ["status = 'active'"];
        const params: any[] = [];
        if (min_price) { params.push(parseInt(String(min_price), 10)); clauses.push(`price_kes >= $${params.length}`); }
        if (max_price) { params.push(parseInt(String(max_price), 10)); clauses.push(`price_kes <= $${params.length}`); }
        if (location) { params.push(`%${location}%`); clauses.push(`location ILIKE $${params.length}`); }
        if (county) { params.push(String(county)); clauses.push(`county = $${params.length}`); }
        if (town) { params.push(String(town)); clauses.push(`town = $${params.length}`); }
        if (String(flash) === 'true') { clauses.push(`is_flash_deal = TRUE`); }

        const where = clauses.length ? `WHERE ${clauses.join(' AND ')}` : '';
        const sql = `SELECT id, title, price_kes, location, images, status, created_at, is_flash_deal FROM listings ${where} ORDER BY created_at DESC LIMIT 100`;
        const result = await pool.query(sql, params);
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
        const listing = result.rows[0];
        // Attach latest top offers (optional)
        const offers = await pool.query(`SELECT id, amount_kes, type, status, created_at FROM offers WHERE listing_id=$1 ORDER BY created_at DESC LIMIT 10`, [req.params.id]);
        return res.json({ ...listing, offers: offers.rows });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Failed to fetch listing' });
    }
});

// Create offer/bid on a listing
router.post('/:id/offers', async (req, res) => {
    try {
        const listingId = req.params.id;
        const { buyer_id, amount_kes, type } = req.body as { buyer_id?: string; amount_kes?: number; type?: 'offer' | 'bid' };
        if (!buyer_id || !amount_kes) return res.status(400).json({ error: 'buyer_id and amount_kes are required' });
        const pool = getPool();

        // Enforce DealStar fee for non-bid offers
        if (type !== 'bid') {
            const u = await pool.query(`SELECT dealstar_paid FROM users WHERE phone=$1 LIMIT 1`, [buyer_id]);
            if (u.rowCount === 0 || u.rows[0].dealstar_paid !== true) {
                return res.status(403).json({ error: 'DealStar fee required to place offers' });
            }
        }

        // Ensure listing is active
        const ls = await pool.query(`SELECT status, min_price_kes FROM listings WHERE id=$1`, [listingId]);
        if (ls.rowCount === 0) return res.status(404).json({ error: 'Listing not found' });
        if (ls.rows[0].status !== 'active') return res.status(400).json({ error: 'Listing is not active' });

        // Optional: reject offers below min_price for direct offers
        if (type !== 'bid' && ls.rows[0].min_price_kes && amount_kes < ls.rows[0].min_price_kes) {
            return res.status(400).json({ error: 'Offer below minimum price' });
        }

        const insert = await pool.query(
            `INSERT INTO offers (listing_id, buyer_id, amount_kes, type, status) VALUES ($1, $2, $3, $4, 'pending') RETURNING id, created_at`,
            [listingId, buyer_id, parseInt(String(amount_kes), 10), type || 'offer']
        );

        // Notify via SSE (if any clients are listening)
        try { sseBroadcast(listingId, { event: 'offer_created', data: { id: insert.rows[0].id, buyer_id, amount_kes, type: type || 'offer', created_at: insert.rows[0].created_at } }); } catch { }

        return res.status(201).json({
            id: insert.rows[0].id,
            message: 'Offer submitted'
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Failed to submit offer' });
    }
});

// Simple SSE for real-time listing events
const sseClients = new Map<string, Set<any>>();
function sseBroadcast(listingId: string, payload: any) {
    const set = sseClients.get(listingId);
    if (!set) return;
    const line = `data: ${JSON.stringify(payload)}\n\n`;
    for (const res of set) {
        res.write(line);
    }
}

router.get('/:id/events', (req, res) => {
    const listingId = req.params.id;
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders?.();

    if (!sseClients.has(listingId)) sseClients.set(listingId, new Set());
    const set = sseClients.get(listingId)!;
    set.add(res);

    req.on('close', () => {
        set.delete(res);
        if (set.size === 0) sseClients.delete(listingId);
    });

    // Initial ping
    res.write(`data: ${JSON.stringify({ event: 'connected' })}\n\n`);
});

export default router;