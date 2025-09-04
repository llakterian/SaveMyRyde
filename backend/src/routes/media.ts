import { Router } from 'express';
import fs from 'fs';
import path from 'path';
import { getPool } from '../config/database';

const router = Router();

// Serve images only if listing is active or requested by owner (by phone)
router.get('/:filename', async (req, res) => {
    try {
        const filename = req.params.filename;
        const asOwner = (req.query.user as string) || ''; // optional ?user=PHONE to preview own draft

        const pool = getPool();
        // Find any listing that references this image
        const q = await pool.query(
            `SELECT id, user_id, status FROM listings WHERE $1 = ANY(images) LIMIT 1`,
            [`/uploads/${filename}`]
        );

        if (q.rowCount === 0) return res.status(404).json({ error: 'Image not found' });

        const { id: listingId, user_id, status } = q.rows[0] as { id: string; user_id: string; status: string };

        if (status !== 'active') {
            // Allow owner preview if phone matches and query includes user
            const isOwner = asOwner && asOwner === user_id;
            if (!isOwner) {
                return res.status(403).json({ error: 'Image locked until payment is verified', listingId, status });
            }
        }

        // Files are stored under /app/uploads when running in container
        const filePath = path.join(process.cwd(), 'uploads', filename);
        if (!fs.existsSync(filePath)) return res.status(404).json({ error: 'File missing' });
        return res.sendFile(filePath);
    } catch (e) {
        console.error(e);
        return res.status(500).json({ error: 'Failed to fetch image' });
    }
});

export default router;