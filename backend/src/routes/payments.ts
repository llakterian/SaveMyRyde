import { Router } from "express";
import {
  initializePayment,
  confirmPayment,
  getUserCredits,
  purchaseCredits,
  getPaymentHistory,
} from "../services/payments";
import { getPool } from "../config/database";

const router = Router();

// Initialize a new payment
router.post("/initialize", initializePayment);

// Confirm a payment
router.post("/confirm", confirmPayment);

// Get user credits and points
router.get("/credits/:userId", getUserCredits);

// Purchase credits
router.post("/credits/purchase", purchaseCredits);

// Get payment history
router.get("/history/:userId", getPaymentHistory);

// Get payment methods and pricing
router.get("/methods", async (req, res) => {
  try {
    const paymentMethods = [
      {
        id: "card",
        name: "Credit/Debit Card",
        description: "Visa, Mastercard, American Express",
        icon: "💳",
        processingFee: 3.5,
        enabled: true,
        estimatedTime: "Instant",
      },
      {
        id: "mobile_money",
        name: "Mobile Money",
        description: "M-Pesa, Airtel Money, T-Kash",
        icon: "📱",
        processingFee: 1.5,
        enabled: true,
        estimatedTime: "1-2 minutes",
      },
      {
        id: "bank_transfer",
        name: "Bank Transfer",
        description: "Direct bank transfer",
        icon: "🏦",
        processingFee: 0,
        enabled: true,
        estimatedTime: "5-30 minutes",
      },
      {
        id: "crypto",
        name: "Cryptocurrency",
        description: "Bitcoin, Ethereum, USDT, USDC",
        icon: "₿",
        processingFee: 2.0,
        enabled: true,
        estimatedTime: "5-15 minutes",
      },
      {
        id: "credits",
        name: "Account Credits",
        description: "Use your saved credits",
        icon: "🪙",
        processingFee: 0,
        enabled: true,
        estimatedTime: "Instant",
      },
    ];

    const pricing = {
      listingFee: {
        basic: 2500,
        premium: 5000,
        vip: 7500,
      },
      features: {
        verification: 1500,
        flashDeal: 1000,
        featuredPlacement: 2000,
        prioritySupport: 500,
      },
      subscriptions: await getSubscriptionPlans(),
      creditPackages: {
        1000: { credits: 1000, bonus: 0, discount: 0 },
        2500: { credits: 2500, bonus: 100, discount: 4 },
        5000: { credits: 5000, bonus: 300, discount: 6 },
        10000: { credits: 10000, bonus: 750, discount: 7.5 },
        25000: { credits: 25000, bonus: 2000, discount: 8 },
      },
    };

    res.json({
      paymentMethods,
      pricing,
    });
  } catch (error) {
    console.error("Get payment methods error:", error);
    return res.status(500).json({ error: "Failed to get payment methods" });
  }
});

// Get subscription plans
async function getSubscriptionPlans(): Promise<any[]> {
  try {
    const pool = getPool();
    const plans = await pool.query(
      "SELECT * FROM subscription_plans WHERE is_active = true ORDER BY price_kes ASC",
    );
    return plans.rows;
  } catch (error) {
    console.error("Get subscription plans error:", error);
    return [];
  }
}

// Subscribe to a plan
router.post("/subscribe", async (req, res) => {
  try {
    const { userId, planId, paymentMethod } = req.body;

    if (!userId || !planId || !paymentMethod) {
      return res
        .status(400)
        .json({ error: "userId, planId, and paymentMethod are required" });
    }

    // Get plan details
    const pool = getPool();
    const plan = await pool.query(
      "SELECT * FROM subscription_plans WHERE id = $1 AND is_active = true",
      [planId],
    );

    if (!plan.rows.length) {
      return res.status(404).json({ error: "Subscription plan not found" });
    }

    const planData = plan.rows[0];

    // Create payment for subscription
    const payment = await pool.query(
      `INSERT INTO payments (user_id, listing_id, amount_kes, status, provider, metadata, type)
             VALUES ($1, NULL, $2, 'initiated', $3, $4, 'subscription')
             RETURNING id`,
      [
        userId,
        planData.price_kes,
        paymentMethod,
        JSON.stringify({
          planId,
          planName: planData.name,
          duration: planData.duration_days,
        }),
      ],
    );

    res.json({
      paymentId: payment.rows[0].id,
      plan: planData,
      message: `Subscription to ${planData.name} initiated`,
    });
  } catch (error) {
    console.error("Subscription error:", error);
    return res.status(500).json({ error: "Failed to initiate subscription" });
  }
});

// Apply referral code
router.post("/referral/apply", async (req, res) => {
  try {
    const { userId, referralCode } = req.body;

    if (!userId || !referralCode) {
      return res
        .status(400)
        .json({ error: "userId and referralCode are required" });
    }

    // Check if referral code exists and is valid
    const pool = getPool();
    const referral = await pool.query(
      "SELECT * FROM referrals WHERE referral_code = $1 AND status = 'pending'",
      [referralCode],
    );

    if (!referral.rows.length) {
      return res.status(404).json({ error: "Invalid referral code" });
    }

    const referralData = referral.rows[0];

    // Check if user hasn't already been referred
    const existingReferral = await pool.query(
      "SELECT id FROM referrals WHERE referred_id = $1",
      [userId],
    );

    if (existingReferral.rows.length) {
      return res
        .status(400)
        .json({ error: "You have already used a referral code" });
    }

    // Update referral with referred user
    await pool.query(
      "UPDATE referrals SET referred_id = $1, status = 'completed', completed_at = NOW() WHERE id = $2",
      [userId, referralData.id],
    );

    // Award credits to both referrer and referred
    const rewardCredits = 1000;

    // Award to referrer
    await pool.query(
      "UPDATE users SET credits_balance = COALESCE(credits_balance, 0) + $1 WHERE id = $2",
      [rewardCredits, referralData.referrer_id],
    );

    // Award to referred user
    await pool.query(
      "UPDATE users SET credits_balance = COALESCE(credits_balance, 0) + $1 WHERE id = $2",
      [rewardCredits, userId],
    );

    // Log credit transactions
    await pool.query(
      `INSERT INTO credit_transactions (user_id, type, amount, balance_after, source, reference_id, description)
             VALUES
             ($1, 'earned', $2, (SELECT COALESCE(credits_balance, 0) FROM users WHERE id = $1), 'referral', $3, 'Referral reward - referred user'),
             ($4, 'earned', $2, (SELECT COALESCE(credits_balance, 0) FROM users WHERE id = $4), 'referral', $3, 'Referral reward - referrer')`,
      [userId, rewardCredits, referralData.id, referralData.referrer_id],
    );

    res.json({
      message: `Referral code applied successfully! You both earned ${rewardCredits} credits.`,
      creditsEarned: rewardCredits,
    });
  } catch (error) {
    console.error("Apply referral error:", error);
    return res.status(500).json({ error: "Failed to apply referral code" });
  }
});

// Generate referral code
router.post("/referral/generate", async (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ error: "userId is required" });
    }

    // Generate unique referral code
    const referralCode = `SMR${userId.slice(-4).toUpperCase()}${Date.now()
      .toString()
      .slice(-4)}`;

    // Create referral record
    const pool = getPool();
    await pool.query(
      "INSERT INTO referrals (referrer_id, referred_id, referral_code, status) VALUES ($1, '', $2, 'pending')",
      [userId, referralCode],
    );

    res.json({
      referralCode,
      message: "Referral code generated successfully",
      shareMessage: `Join SaveMyRyde and get 1000 credits free! Use my referral code: ${referralCode}`,
    });
  } catch (error) {
    console.error("Generate referral error:", error);
    return res.status(500).json({ error: "Failed to generate referral code" });
  }
});

// Admin: Get all payments with filters
router.get("/admin/payments", async (req, res) => {
  try {
    const {
      status,
      provider,
      type,
      page = 1,
      limit = 50,
      startDate,
      endDate,
    } = req.query;

    let query = `
            SELECT
                p.*,
                l.title as listing_title,
                l.contact_phone
            FROM payments p
            LEFT JOIN listings l ON p.listing_id = l.id
            WHERE 1=1
        `;

    const params: any[] = [];
    let paramCount = 0;

    if (status) {
      paramCount++;
      query += ` AND p.status = $${paramCount}`;
      params.push(status);
    }

    if (provider) {
      paramCount++;
      query += ` AND p.provider = $${paramCount}`;
      params.push(provider);
    }

    if (type) {
      paramCount++;
      query += ` AND p.type = $${paramCount}`;
      params.push(type);
    }

    if (startDate) {
      paramCount++;
      query += ` AND p.created_at >= $${paramCount}`;
      params.push(startDate);
    }

    if (endDate) {
      paramCount++;
      query += ` AND p.created_at <= $${paramCount}`;
      params.push(endDate);
    }

    query += ` ORDER BY p.created_at DESC`;

    const offset = (Number(page) - 1) * Number(limit);
    paramCount++;
    query += ` LIMIT $${paramCount}`;
    params.push(limit);

    paramCount++;
    query += ` OFFSET $${paramCount}`;
    params.push(offset);

    const pool = getPool();
    const payments = await pool.query(query, params);

    // Get total count for pagination
    let countQuery = "SELECT COUNT(*) FROM payments p WHERE 1=1";
    const countParams: any[] = [];
    let countParamCount = 0;

    if (status) {
      countParamCount++;
      countQuery += ` AND p.status = $${countParamCount}`;
      countParams.push(status);
    }

    if (provider) {
      countParamCount++;
      countQuery += ` AND p.provider = $${countParamCount}`;
      countParams.push(provider);
    }

    if (type) {
      countParamCount++;
      countQuery += ` AND p.type = $${countParamCount}`;
      countParams.push(type);
    }

    if (startDate) {
      countParamCount++;
      countQuery += ` AND p.created_at >= $${countParamCount}`;
      countParams.push(startDate);
    }

    if (endDate) {
      countParamCount++;
      countQuery += ` AND p.created_at <= $${countParamCount}`;
      countParams.push(endDate);
    }

    const totalCount = await pool.query(countQuery, countParams);

    res.json({
      payments: payments.rows,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total: Number(totalCount.rows[0].count),
        pages: Math.ceil(Number(totalCount.rows[0].count) / Number(limit)),
      },
    });
  } catch (error) {
    console.error("Admin get payments error:", error);
    return res.status(500).json({ error: "Failed to get payments" });
  }
});

// Admin: Update payment status
router.patch("/admin/payments/:paymentId", async (req, res) => {
  try {
    const { paymentId } = req.params;
    const { status, adminNotes } = req.body;

    if (!status) {
      return res.status(400).json({ error: "status is required" });
    }

    const validStatuses = [
      "initiated",
      "successful",
      "failed",
      "pending",
      "cancelled",
    ];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: "Invalid status" });
    }

    // Get current payment
    const pool = getPool();
    const payment = await pool.query("SELECT * FROM payments WHERE id = $1", [
      paymentId,
    ]);

    if (!payment.rows.length) {
      return res.status(404).json({ error: "Payment not found" });
    }

    const paymentData = payment.rows[0];

    // Update payment
    await pool.query(
      "UPDATE payments SET status = $1, metadata = $2, updated_at = NOW() WHERE id = $3",
      [
        status,
        JSON.stringify({
          ...paymentData.metadata,
          adminNotes,
          adminUpdatedAt: new Date().toISOString(),
        }),
        paymentId,
      ],
    );

    // If marking as successful, activate listing and award credits
    if (status === "successful" && paymentData.status !== "successful") {
      if (paymentData.listing_id) {
        await pool.query(
          "UPDATE listings SET status = 'active', ride_safe_paid_at = NOW() WHERE id = $1",
          [paymentData.listing_id],
        );
      }

      // Award cashback credits
      const creditsEarned = Math.floor(paymentData.amount_kes * 0.01);
      await pool.query(
        "UPDATE users SET credits_balance = COALESCE(credits_balance, 0) + $1 WHERE id = $2",
        [creditsEarned, paymentData.user_id],
      );

      // Log credit transaction
      await pool.query(
        `INSERT INTO credit_transactions (user_id, type, amount, balance_after, source, reference_id, description)
                 VALUES ($1, 'earned', $2, (SELECT COALESCE(credits_balance, 0) FROM users WHERE id = $1), 'payment_cashback', $3, 'Cashback for payment')`,
        [paymentData.user_id, creditsEarned, paymentId],
      );
    }

    res.json({
      message: "Payment status updated successfully",
      status,
    });
  } catch (error) {
    console.error("Admin update payment error:", error);
    return res.status(500).json({ error: "Failed to update payment status" });
  }
});

export default router;
