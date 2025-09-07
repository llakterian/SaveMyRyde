import { connectDatabase, getPool, closeDatabase } from '../config/database'

async function seedAuctionListings() {
    await connectDatabase()
    const pool = getPool()

    // Real auction data based on Family Bank and other Kenyan auction houses
    const auctionListings = [
        {
            title: "ISUZU FRR90 COVER BODY LORRY",
            description: "KDH 359R - Commercial vehicle in good condition. Ready for immediate sale. Seized vehicle from auction. Contact seller for viewing arrangements.",
            priceKes: 4000000,
            minPriceKes: 3500000,
            location: "Nairobi, Nairobi",
            county: "Nairobi",
            town: "Thika Road",
            images: [],
            badges: ["RideSafe", "Verified", "Auction"],
            isFlashDeal: false,
            auctionDeadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        },
        {
            title: "TOYOTA FIELDER ZRE162",
            description: "KCX 387A - Clean Toyota Fielder in excellent condition. Well maintained, accident-free unit. Perfect family car with good fuel economy.",
            priceKes: 950000,
            minPriceKes: 850000,
            location: "Eldoret, Uasin Gishu",
            county: "Uasin Gishu",
            town: "Eldoret",
            images: [],
            badges: ["RideSafe", "Flash Deal", "Popular"],
            isFlashDeal: true,
            auctionDeadline: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
        },
        {
            title: "CATERPILLAR EXCAVATOR 320C",
            description: "KHMA 564T - Heavy machinery excavator in working condition. Perfect for construction and mining operations. Comes with service records.",
            priceKes: 5500000,
            minPriceKes: 4800000,
            location: "Nakuru, Nakuru",
            county: "Nakuru",
            town: "Nakuru",
            images: [],
            badges: ["RideSafe", "Heavy Machinery", "Verified"],
            isFlashDeal: false,
            auctionDeadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
        },
        {
            title: "SCANIA G450 PRIME MOVER AUTO 6*2",
            description: "KDR 359T - Professional transport truck in excellent working condition. Low mileage, full service history. Ideal for long-haul transportation.",
            priceKes: 4800000,
            minPriceKes: 4200000,
            location: "Nairobi, Nairobi",
            county: "Nairobi",
            town: "Industrial Area",
            images: [],
            badges: ["RideSafe", "Commercial", "Low Mileage"],
            isFlashDeal: false,
            auctionDeadline: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), // 10 days from now
        },
        {
            title: "MAZDA BONGO SKP2T PICK-UP",
            description: "KDJ 158V - Reliable pickup truck perfect for small business. Clean unit with good maintenance record. Ready for immediate use.",
            priceKes: 850000,
            minPriceKes: 750000,
            location: "Kajiado, Kajiado",
            county: "Kajiado",
            town: "Kitengela",
            images: [],
            badges: ["RideSafe", "Business Ready", "Flash Deal"],
            isFlashDeal: true,
            auctionDeadline: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
        },
        {
            title: "MERCEDES BENZ ACTROS 2545",
            description: "KDN 269V - Premium commercial truck in excellent condition. Low hours, full maintenance records. Perfect for freight transport business.",
            priceKes: 4300000,
            minPriceKes: 3800000,
            location: "Bungoma, Bungoma",
            county: "Bungoma",
            town: "Bungoma",
            images: [],
            badges: ["RideSafe", "Premium", "Commercial"],
            isFlashDeal: false,
            auctionDeadline: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000), // 12 days from now
        },
        {
            title: "NISSAN TEANA J32",
            description: "KCL 312N - Luxury sedan in good condition. Comfortable interior, smooth drive. Perfect executive car with premium features.",
            priceKes: 500000,
            minPriceKes: 450000,
            location: "Nairobi, Nairobi",
            county: "Nairobi",
            town: "Westlands",
            images: [],
            badges: ["RideSafe", "Luxury", "Executive"],
            isFlashDeal: false,
            auctionDeadline: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000), // 8 days from now
        },
        // Additional popular Kenyan car models from auction market
        {
            title: "TOYOTA VITZ KCP 1000CC",
            description: "KDA 123B - Fuel efficient compact car perfect for city driving. Clean unit with low mileage. Great starter car for new drivers.",
            priceKes: 650000,
            minPriceKes: 580000,
            location: "Mombasa, Mombasa",
            county: "Mombasa",
            town: "Mombasa Island",
            images: [],
            badges: ["RideSafe", "Fuel Efficient", "City Car"],
            isFlashDeal: false,
            auctionDeadline: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000), // 6 days from now
        },
        {
            title: "SUBARU FORESTER 2.0L AWD",
            description: "KDB 456C - All-wheel drive SUV perfect for Kenyan roads. Great ground clearance, reliable 4WD system. Family-friendly with cargo space.",
            priceKes: 1200000,
            minPriceKes: 1050000,
            location: "Kisumu, Kisumu",
            county: "Kisumu",
            town: "Kisumu",
            images: [],
            badges: ["RideSafe", "AWD", "Family SUV"],
            isFlashDeal: true,
            auctionDeadline: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000), // 4 days from now
        },
        {
            title: "NISSAN X-TRAIL 2.0L CVT",
            description: "KDB 789D - Popular family SUV with CVT transmission. Spacious interior, good ground clearance. Perfect for both city and upcountry travel.",
            priceKes: 1350000,
            minPriceKes: 1200000,
            location: "Nakuru, Nakuru",
            county: "Nakuru",
            town: "Nakuru",
            images: [],
            badges: ["RideSafe", "Family SUV", "CVT"],
            isFlashDeal: false,
            auctionDeadline: new Date(Date.now() + 9 * 24 * 60 * 60 * 1000), // 9 days from now
        },
        {
            title: "TOYOTA NOAH 8-SEATER",
            description: "KDC 321E - Spacious family van perfect for large families. 8-seater configuration with sliding doors. Great for family trips and business use.",
            priceKes: 1100000,
            minPriceKes: 950000,
            location: "Nairobi, Nairobi",
            county: "Nairobi",
            town: "Kasarani",
            images: [],
            badges: ["RideSafe", "8-Seater", "Family Van"],
            isFlashDeal: true,
            auctionDeadline: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
        },
        {
            title: "HONDA FIT 1.3L HYBRID",
            description: "KDC 654F - Fuel efficient hybrid hatchback. Perfect combination of economy and reliability. Great for daily commuting with low running costs.",
            priceKes: 750000,
            minPriceKes: 680000,
            location: "Nairobi, Nairobi",
            county: "Nairobi",
            town: "Embakasi",
            images: [],
            badges: ["RideSafe", "Hybrid", "Eco-Friendly"],
            isFlashDeal: false,
            auctionDeadline: new Date(Date.now() + 11 * 24 * 60 * 60 * 1000), // 11 days from now
        },
    ]

    // Demo seller phones for different regions
    const sellerPhones = [
        '0701234567', // Nairobi
        '0702345678', // Eldoret
        '0703456789', // Nakuru
        '0704567890', // Mombasa
        '0705678901', // Kisumu
        '0706789012', // Bungoma
        '0707890123', // Kajiado
    ]

    console.log('🚀 Starting to seed auction listings...')

    for (let i = 0; i < auctionListings.length; i++) {
        const listing = auctionListings[i]
        const sellerPhone = sellerPhones[i % sellerPhones.length]

        // Ensure seller user exists
        await pool.query(
            `INSERT INTO users (id, name, email, phone, role)
             VALUES (gen_random_uuid(), $1, $2, $3, 'seller')
             ON CONFLICT (email) DO NOTHING`,
            [
                `Seller ${i + 1}`,
                `seller${i + 1}@savemyryde.co.ke`,
                sellerPhone
            ]
        )

        // Check if listing already exists
        const existing = await pool.query(
            `SELECT id FROM listings WHERE title=$1 AND contact_phone=$2`,
            [listing.title, sellerPhone]
        )

        if (existing.rowCount === 0) {
            // Insert new listing
            const result = await pool.query(
                `INSERT INTO listings (
                    user_id, contact_phone, title, description, price_kes, min_price_kes,
                    location, county, town, images, status, badges, is_flash_deal,
                    auction_deadline, verification_status, expires_at, ride_safe_paid_at
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 'active', $11, $12, $13, 'verified', $14, NOW())
                RETURNING id`,
                [
                    sellerPhone,
                    sellerPhone,
                    listing.title,
                    listing.description,
                    listing.priceKes,
                    listing.minPriceKes,
                    listing.location,
                    listing.county,
                    listing.town,
                    listing.images,
                    listing.badges,
                    listing.isFlashDeal,
                    listing.auctionDeadline,
                    new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // expires in 30 days
                ]
            )

            console.log(`✅ Created listing: ${listing.title} - ${result.rows[0].id}`)

            // Add some sample offers for popular vehicles
            if (listing.title.includes('FIELDER') || listing.title.includes('X-TRAIL') || listing.title.includes('NOAH')) {
                const buyerPhone = `070${Math.floor(Math.random() * 9000000) + 1000000}`

                // Ensure buyer exists
                await pool.query(
                    `INSERT INTO users (id, name, email, phone, role, dealstar_paid)
                     VALUES (gen_random_uuid(), $1, $2, $3, 'buyer', true)
                     ON CONFLICT (email) DO NOTHING`,
                    [
                        `Buyer ${buyerPhone.slice(-4)}`,
                        `buyer${buyerPhone.slice(-4)}@example.com`,
                        buyerPhone
                    ]
                )

                // Add offer
                await pool.query(
                    `INSERT INTO offers (listing_id, buyer_id, amount_kes, type, status)
                     VALUES ($1, $2, $3, 'offer', 'pending')`,
                    [
                        result.rows[0].id,
                        buyerPhone,
                        Math.floor(listing.minPriceKes + (listing.priceKes - listing.minPriceKes) * 0.7)
                    ]
                )
            }
        } else {
            console.log(`⚠️  Listing already exists: ${listing.title}`)
        }
    }

    console.log('🎉 Auction listings seeding completed!')
    console.log('📊 Access the listings at: /listings')
}

seedAuctionListings().catch((e) => {
    console.error('❌ Auction seed failed:', e)
    process.exit(1)
}).finally(async () => {
    try {
        await closeDatabase()
    } catch {
        // ignore close errors
    }
})