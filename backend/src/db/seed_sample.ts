import { connectDatabase, getPool, closeDatabase } from '../config/database'

async function seed() {
    await connectDatabase()
    const pool = getPool()

    // Simple deterministic buyer/seller phones for demo
    const demoSellerPhone = '0700000001'
    const demoBuyerPhone = '0700000002'

    // Ensure users exist
    await pool.query(
        `INSERT INTO users (id, name, email, phone, role)
     VALUES (gen_random_uuid(), 'Demo Seller', 'seller@example.com', $1, 'seller')
     ON CONFLICT (email) DO NOTHING`,
        [demoSellerPhone]
    )
    await pool.query(
        `INSERT INTO users (id, name, email, phone, role)
     VALUES (gen_random_uuid(), 'Demo Buyer', 'buyer@example.com', $1, 'buyer')
     ON CONFLICT (email) DO NOTHING`,
        [demoBuyerPhone]
    )

    // Insert or reuse a listing
    const title = '2014 Toyota Axio'
    const existing = await pool.query(
        `SELECT id FROM listings WHERE title=$1 AND status='active' ORDER BY created_at DESC LIMIT 1`,
        [title]
    )

    let listingId: string
    if ((existing.rowCount ?? 0) > 0) {
        listingId = existing.rows[0].id
    } else {
        const insert = await pool.query(
            `INSERT INTO listings (
        user_id, contact_phone, title, description, price_kes, location, images, status,
        expires_at, county, town, min_price_kes, is_flash_deal
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, 'active', NOW() + INTERVAL '30 days',
        $8, $9, $10, $11
      ) RETURNING id`,
            [
                demoSellerPhone,
                demoSellerPhone,
                title,
                'Clean unit, accident free. Ready to go.',
                850000,
                'Nairobi, Nairobi',
                [],
                'Nairobi',
                'Westlands',
                800000,
                false,
            ]
        )
        listingId = insert.rows[0].id
    }

    console.log('✅ Seeded sample active listing:', listingId)
    console.log('   Test detail page at: /listings/' + listingId)

    // Optional: insert a sample offer
    const offer = await pool.query(
        `INSERT INTO offers (listing_id, buyer_id, amount_kes, type, status)
     VALUES ($1, $2, $3, 'offer', 'pending') RETURNING id`,
        [listingId, demoBuyerPhone, 820000]
    )
    console.log('✅ Inserted sample offer:', offer.rows[0].id)
}

seed().catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
}).finally(async () => {
    try { await closeDatabase() } catch { }
})