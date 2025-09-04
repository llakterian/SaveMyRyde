import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { getPool } from '../config/database';
import { signJwt } from '../middleware/auth';
import { getRedisClient } from '../config/redis';
import { isValidKenyanPhone, normalizeKenyanPhone } from '../utils/phone';

const router = Router();

// POST /api/auth/login
// body: { identifier: string (email or phone), password: string }
router.post('/login', async (req, res) => {
    try {
        const { identifier, password } = req.body as { identifier?: string; password?: string };
        if (!identifier || !password) {
            return res.status(400).json({ error: 'identifier and password are required' });
        }

        const pool = getPool();
        const q = await pool.query(
            `SELECT id, email, phone, role, password_hash FROM users WHERE email = $1 OR phone = $1 LIMIT 1`,
            [identifier]
        );

        if (q.rowCount === 0) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const user = q.rows[0] as { id: string; email: string | null; phone: string | null; role: string; password_hash: string | null };

        if (!user.password_hash) {
            return res.status(403).json({ error: 'Password login not enabled for this account' });
        }

        const ok = await bcrypt.compare(password, user.password_hash);
        if (!ok) return res.status(401).json({ error: 'Invalid credentials' });

        const token = signJwt({ userId: user.id, role: user.role, email: user.email, phone: user.phone });
        return res.json({ token, user: { id: user.id, email: user.email, phone: user.phone, role: user.role } });
    } catch (e) {
        console.error(e);
        return res.status(500).json({ error: 'Login failed' });
    }
});

// POST /api/auth/otp/request
// body: { phone: string }
router.post('/otp/request', async (req, res) => {
    try {
        const { phone } = req.body as { phone?: string };
        if (!phone) return res.status(400).json({ error: 'phone is required' });

        // Validate and normalize to +2547XXXXXXXX / +2541XXXXXXXX
        if (!isValidKenyanPhone(phone)) {
            return res.status(400).json({ error: 'Invalid Kenyan phone. Use +2547XXXXXXXX or 07XXXXXXXX/01XXXXXXXX' });
        }
        const normalized = normalizeKenyanPhone(phone);

        const code = Math.floor(100000 + Math.random() * 900000).toString();
        const redis = getRedisClient();
        const key = `otp:${normalized}`;
        await redis.set(key, code, { EX: 300 }); // 5 minutes

        // TODO: integrate SMS provider
        console.log(`[OTP] Code for ${normalized}: ${code}`);

        return res.json({ message: 'OTP sent' });
    } catch (e) {
        console.error(e);
        return res.status(500).json({ error: 'Failed to request OTP' });
    }
});

// POST /api/auth/otp/verify
// body: { phone: string, code: string }
router.post('/otp/verify', async (req, res) => {
    try {
        const { phone, code } = req.body as { phone?: string; code?: string };
        if (!phone || !code) return res.status(400).json({ error: 'phone and code are required' });

        if (!isValidKenyanPhone(phone)) {
            return res.status(400).json({ error: 'Invalid Kenyan phone format' });
        }
        const normalized = normalizeKenyanPhone(phone);

        const redis = getRedisClient();
        const key = `otp:${normalized}`;
        const saved = await redis.get(key);
        if (!saved || saved !== code) return res.status(401).json({ error: 'Invalid code' });

        // consume code
        await redis.del(key);

        const pool = getPool();
        const q = await pool.query(`SELECT id, email, phone, role FROM users WHERE phone = $1 ORDER BY created_at ASC LIMIT 1`, [normalized]);
        let user = q.rows[0] as { id: string; email: string | null; phone: string | null; role: string } | undefined;
        if (!user) {
            const ins = await pool.query(
                `INSERT INTO users (name, email, phone, role) VALUES ($1, NULL, $2, 'buyer') RETURNING id, email, phone, role`,
                [normalized, normalized]
            );
            user = ins.rows[0];
        }

        const token = signJwt({ userId: user.id, role: user.role, email: user.email, phone: user.phone });
        return res.json({ token, user });
    } catch (e) {
        console.error(e);
        return res.status(500).json({ error: 'Failed to verify OTP' });
    }
});

export default router;