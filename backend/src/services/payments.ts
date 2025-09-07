import { Request, Response } from "express";
import { getPool } from "../config/database";

// Modern payment flow: Credit system with multiple payment options

export async function initializePayment(req: Request, res: Response) {
  try {
    const { userId, listingId, paymentMethod, amount } = req.body as {
      userId: string;
      listingId: string;
      paymentMethod:
        | "card"
        | "mobile_money"
        | "bank_transfer"
        | "crypto"
        | "credits";
      amount: number;
    };

    if (!userId || !listingId || !paymentMethod || !amount) {
      return res.status(400).json({
        error: "userId, listingId, paymentMethod, and amount are required",
      });
    }

    // Create payment record
    const pool = getPool();
    const payment = await pool.query(
      `INSERT INTO payments (user_id, listing_id, amount_kes, status, provider, metadata)
             VALUES ($1, $2, $3, 'initiated', $4, $5)
             RETURNING id`,
      [
        userId,
        listingId,
        amount,
        paymentMethod,
        JSON.stringify({ paymentMethod, timestamp: new Date().toISOString() }),
      ],
    );

    const paymentId = payment.rows[0].id;

    // Generate payment intent based on method
    let paymentData = {};

    switch (paymentMethod) {
      case "card":
        paymentData = {
          method: "card",
          clientSecret: `pi_${paymentId}_secret_${Date.now()}`,
          publicKey: "pk_test_savemyryde",
          currency: "KES",
        };
        break;

      case "mobile_money":
        paymentData = {
          method: "mobile_money",
          providers: [
            { name: "Safaricom (M-Pesa)", code: "mpesa" },
            { name: "Airtel Money", code: "airtel" },
            { name: "T-Kash", code: "tkash" },
          ],
          instructions: "Select your mobile money provider to complete payment",
        };
        break;

      case "bank_transfer":
        paymentData = {
          method: "bank_transfer",
          bankDetails: {
            accountName: "SaveMyRyde Limited",
            accountNumber: "0101355308",
            bankName: "KCB Bank",
            branch: "Westlands",
            swiftCode: "KCBLKENX",
          },
          reference: paymentId,
        };
        break;

      case "crypto":
        paymentData = {
          method: "crypto",
          supportedCurrencies: ["BTC", "ETH", "USDT", "USDC"],
          walletAddress: "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh",
          qrCode: `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==`,
        };
        break;

      case "credits":
        // Check user credit balance
        const userCredits = await pool.query(
          "SELECT credits_balance FROM users WHERE id = $1",
          [userId],
        );

        if (
          !userCredits.rows.length ||
          userCredits.rows[0].credits_balance < amount
        ) {
          return res.status(400).json({ error: "Insufficient credits" });
        }

        // Deduct credits and mark payment as successful
        await pool.query(
          "UPDATE users SET credits_balance = credits_balance - $1 WHERE id = $2",
          [amount, userId],
        );

        await pool.query("UPDATE payments SET status = $1 WHERE id = $2", [
          "successful",
          paymentId,
        ]);

        paymentData = {
          method: "credits",
          status: "completed",
          message: "Payment completed using account credits",
        };
        break;
    }

    res.json({
      paymentId,
      ...paymentData,
    });
  } catch (error) {
    console.error("Payment initialization error:", error);
    return res.status(500).json({ error: "Failed to initialize payment" });
  }
}

export async function confirmPayment(req: Request, res: Response) {
  try {
    const { paymentId, confirmationData } = req.body;

    if (!paymentId || !confirmationData) {
      return res
        .status(400)
        .json({ error: "paymentId and confirmationData are required" });
    }

    // Get payment record
    const pool = getPool();
    const payment = await pool.query("SELECT * FROM payments WHERE id = $1", [
      paymentId,
    ]);

    if (!payment.rows.length) {
      return res.status(404).json({ error: "Payment not found" });
    }

    const paymentRecord = payment.rows[0];

    // Update payment status based on confirmation
    let status = "successful";
    let providerRef =
      confirmationData.reference || confirmationData.transactionId;

    // For demo purposes, we'll mark most payments as successful
    // In production, you'd verify with actual payment providers
    if (confirmationData.status === "failed") {
      status = "failed";
    }

    await pool.query(
      "UPDATE payments SET status = $1, provider_ref = $2, metadata = $3 WHERE id = $4",
      [
        status,
        providerRef,
        JSON.stringify({
          ...paymentRecord.metadata,
          confirmation: confirmationData,
        }),
        paymentId,
      ],
    );

    // If successful, update listing status
    if (status === "successful") {
      await pool.query(
        "UPDATE listings SET status = $1, ride_safe_paid_at = NOW() WHERE id = $2",
        ["active", paymentRecord.listing_id],
      );

      // Award credits for successful transactions (loyalty program)
      const creditsEarned = Math.floor(paymentRecord.amount_kes * 0.01); // 1% cashback
      await pool.query(
        "UPDATE users SET credits_balance = COALESCE(credits_balance, 0) + $1 WHERE id = $2",
        [creditsEarned, paymentRecord.user_id],
      );
    }

    res.json({
      status,
      message:
        status === "successful"
          ? "Payment confirmed successfully"
          : "Payment failed",
      creditsEarned:
        status === "successful"
          ? Math.floor(paymentRecord.amount_kes * 0.01)
          : 0,
    });
  } catch (error) {
    console.error("Payment confirmation error:", error);
    return res.status(500).json({ error: "Failed to confirm payment" });
  }
}

export async function getUserCredits(req: Request, res: Response) {
  try {
    const { userId } = req.params;

    const pool = getPool();
    const user = await pool.query(
      "SELECT credits_balance, dealstar_points FROM users WHERE id = $1",
      [userId],
    );

    if (!user.rows.length) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({
      credits: user.rows[0].credits_balance || 0,
      points: user.rows[0].dealstar_points || 0,
    });
  } catch (error) {
    console.error("Get user credits error:", error);
    return res.status(500).json({ error: "Failed to get user credits" });
  }
}

export async function purchaseCredits(req: Request, res: Response) {
  try {
    const { userId, amount, paymentMethod } = req.body;

    if (!userId || !amount || !paymentMethod) {
      return res
        .status(400)
        .json({ error: "userId, amount, and paymentMethod are required" });
    }

    // Credits packages with bonuses
    const creditPackages = {
      1000: { credits: 1000, bonus: 0 },
      2500: { credits: 2500, bonus: 100 },
      5000: { credits: 5000, bonus: 300 },
      10000: { credits: 10000, bonus: 750 },
      25000: { credits: 25000, bonus: 2000 },
    };

    const creditPackage = creditPackages[amount as keyof typeof creditPackages];
    if (!creditPackage) {
      return res.status(400).json({ error: "Invalid credit package amount" });
    }

    // Create payment record for credit purchase
    const pool = getPool();
    const payment = await pool.query(
      `INSERT INTO payments (user_id, listing_id, amount_kes, status, provider, metadata, type)
             VALUES ($1, NULL, $2, 'initiated', $3, $4, 'credits_purchase')
             RETURNING id`,
      [
        userId,
        amount,
        paymentMethod,
        JSON.stringify({ creditPackage, timestamp: new Date().toISOString() }),
      ],
    );

    const paymentId = payment.rows[0].id;

    res.json({
      paymentId,
      creditPackage,
      totalCredits: creditPackage.credits + creditPackage.bonus,
      message: `Purchase ${creditPackage.credits} credits + ${creditPackage.bonus} bonus credits for KES ${amount}`,
    });
  } catch (error) {
    console.error("Credit purchase error:", error);
    return res
      .status(500)
      .json({ error: "Failed to initiate credit purchase" });
  }
}

export async function getPaymentHistory(req: Request, res: Response) {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 20 } = req.query;

    const offset = (Number(page) - 1) * Number(limit);

    const pool = getPool();
    const payments = await pool.query(
      `SELECT p.*, l.title as listing_title
             FROM payments p
             LEFT JOIN listings l ON p.listing_id = l.id
             WHERE p.user_id = $1
             ORDER BY p.created_at DESC
             LIMIT $2 OFFSET $3`,
      [userId, limit, offset],
    );

    const totalCount = await pool.query(
      "SELECT COUNT(*) FROM payments WHERE user_id = $1",
      [userId],
    );

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
    console.error("Payment history error:", error);
    return res.status(500).json({ error: "Failed to get payment history" });
  }
}

// Legacy functions for backward compatibility
export async function claimManualListingPayment(req: Request, res: Response) {
  try {
    const { userId, listingId, mpesaCode } = req.body as {
      userId: string;
      listingId: string;
      mpesaCode: string;
    };

    if (!userId || !listingId || !mpesaCode) {
      return res
        .status(400)
        .json({ error: "userId, listingId, mpesaCode are required" });
    }

    const pool = getPool();

    // Ensure listing is pending_payment before accepting claim
    const ls = await pool.query(
      `SELECT status FROM listings WHERE id=$1 LIMIT 1`,
      [listingId],
    );
    if (ls.rowCount === 0)
      return res.status(404).json({ error: "Listing not found" });
    if (ls.rows[0].status !== "pending_payment") {
      return res.status(400).json({ error: "Listing is not awaiting payment" });
    }

    // Create a pending payment claim
    const amount_kes = 2500;
    const insert = await pool.query(
      `INSERT INTO payments (user_id, listing_id, amount_kes, status, provider, provider_ref, metadata)
       VALUES ($1, $2, $3, 'initiated', 'manual', $4, $5)
       RETURNING id`,
      [
        userId,
        listingId,
        amount_kes,
        mpesaCode,
        JSON.stringify({ manual: true }),
      ],
    );

    return res.status(200).json({
      message:
        "Payment claim submitted. Admin will verify and publish your listing shortly.",
      paymentId: insert.rows[0].id,
    });
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({ error: "Failed to submit manual payment claim" });
  }
}

export async function adminVerifyPayment(req: Request, res: Response) {
  try {
    const { paymentId, approve } = req.body as {
      paymentId: string;
      approve: boolean;
    };
    if (!paymentId)
      return res.status(400).json({ error: "paymentId is required" });

    const pool = getPool();
    const pay = await pool.query(
      `SELECT listing_id FROM payments WHERE id = $1`,
      [paymentId],
    );
    if (pay.rowCount === 0)
      return res.status(404).json({ error: "Payment not found" });
    const listingId = pay.rows[0].listing_id as string;

    // Verify listing is in pending_payment before publishing
    const ls = await pool.query(`SELECT status FROM listings WHERE id=$1`, [
      listingId,
    ]);
    if (ls.rowCount === 0)
      return res.status(404).json({ error: "Listing not found" });

    if (approve) {
      if (ls.rows[0].status !== "pending_payment") {
        return res
          .status(400)
          .json({ error: "Only pending listings can be activated" });
      }
      await pool.query(`UPDATE payments SET status='successful' WHERE id=$1`, [
        paymentId,
      ]);
      await pool.query(
        `UPDATE listings SET status='active', updated_at=NOW(), ride_safe_paid_at=NOW() WHERE id=$1`,
        [listingId],
      );
      return res.json({ message: "Payment approved and listing published" });
    } else {
      await pool.query(`UPDATE payments SET status='failed' WHERE id=$1`, [
        paymentId,
      ]);
      return res.json({ message: "Payment rejected" });
    }
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to verify payment" });
  }
}
