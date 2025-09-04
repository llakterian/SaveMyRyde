import { getPool } from '../config/database';
import { Request, Response } from 'express';

// Manual payment flow: user pays to Loop Bank Paybill, submits M-Pesa code; admin verifies later.

export async function claimManualListingPayment(req: Request, res: Response) {
    try {
        const { userId, listingId, mpesaCode } = req.body as {
            userId: string;
            listingId: string;
            mpesaCode: string; // e.g., QFT12ABC34
        };

        if (!userId || !listingId || !mpesaCode) {
            return res.status(400).json({ error: 'userId, listingId, mpesaCode are required' });
        }

        const pool = getPool();

        // Create a pending payment claim
        const amount_kes = 2500;
        const insert = await pool.query(
            `INSERT INTO payments (user_id, listing_id, amount_kes, status, provider, provider_ref, metadata)
       VALUES ($1, $2, $3, 'initiated', 'mpesa-manual', $4, $5)
       RETURNING id`,
            [userId, listingId, amount_kes, mpesaCode, JSON.stringify({ manual: true })]
        );

        return res.status(200).json({
            message: 'Payment claim submitted. Admin will verify and publish your listing shortly.',
            paymentId: insert.rows[0].id,
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Failed to submit manual payment claim' });
    }
}

export async function adminVerifyPayment(req: Request, res: Response) {
    try {
        const { paymentId, approve } = req.body as { paymentId: string; approve: boolean };
        if (!paymentId) return res.status(400).json({ error: 'paymentId is required' });

        const pool = getPool();
        const pay = await pool.query(`SELECT listing_id FROM payments WHERE id = $1`, [paymentId]);
        if (pay.rowCount === 0) return res.status(404).json({ error: 'Payment not found' });
        const listingId = pay.rows[0].listing_id as string;

        if (approve) {
            await pool.query(`UPDATE payments SET status='successful' WHERE id=$1`, [paymentId]);
            await pool.query(`UPDATE listings SET status='active', updated_at=NOW() WHERE id=$1`, [listingId]);
            return res.json({ message: 'Payment approved and listing published' });
        } else {
            await pool.query(`UPDATE payments SET status='failed' WHERE id=$1`, [paymentId]);
            return res.json({ message: 'Payment rejected' });
        }
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Failed to verify payment' });
    }
}