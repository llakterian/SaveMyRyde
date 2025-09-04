import { getPool } from '../config/database';
import { Request, Response } from 'express';

// NOTE: Placeholder M-Pesa integration. Swap with Safaricom Daraja in production.
// For now, we simulate payment: if amount == 2500 we mark as successful.

export async function initiateListingPayment(req: Request, res: Response) {
    try {
        const { userId, listingId } = req.body;
        const amount_kes = 2500; // fixed listing fee

        if (!userId || !listingId) {
            return res.status(400).json({ error: 'userId and listingId are required' });
        }

        const pool = getPool();

        // record payment as initiated
        const paymentInsert = await pool.query(
            `INSERT INTO payments (user_id, listing_id, amount_kes, status, provider, metadata)
       VALUES ($1, $2, $3, 'initiated', 'mpesa', $4)
       RETURNING id`,
            [userId, listingId, amount_kes, JSON.stringify({ simulated: true })]
        );

        // Simulate success immediately (replace with STK Push and callback later)
        const paymentId = paymentInsert.rows[0].id as string;
        await pool.query(`UPDATE payments SET status = 'successful', provider_ref = $1 WHERE id = $2`, [
            'SIM-' + Date.now(),
            paymentId,
        ]);

        // Set listing to public
        await pool.query(`UPDATE listings SET status = 'public', updated_at = NOW() WHERE id = $1`, [listingId]);

        return res.status(200).json({
            message: 'Payment successful. Listing is now public.',
            paymentId,
            amount_kes,
        });
    } catch (err: any) {
        console.error(err);
        return res.status(500).json({ error: 'Failed to process payment' });
    }
}