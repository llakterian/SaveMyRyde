import { getRedisClient } from '../config/redis';
import { sendEmail } from '../config/mailer';
import twilio from 'twilio';

const {
    TWILIO_ACCOUNT_SID,
    TWILIO_AUTH_TOKEN,
    TWILIO_WHATSAPP_FROM // e.g., 'whatsapp:+14155238886' (Twilio sandbox number)
} = process.env as Record<string, string | undefined>;

let twilioClient: ReturnType<typeof twilio> | null = null;
function getTwilio() {
    if (twilioClient) return twilioClient;
    if (TWILIO_ACCOUNT_SID && TWILIO_AUTH_TOKEN) {
        twilioClient = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);
    }
    return twilioClient;
}

export async function generateAndStoreOtp(normalizedPhone: string): Promise<string> {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const redis = getRedisClient();
    const key = `otp:${normalizedPhone}`;
    await redis.set(key, code, { EX: 300 }); // 5 minutes
    return code;
}

export async function sendOtpBySms(normalizedPhone: string, code: string) {
    // Placeholder: integrate a Kenyan SMS provider here later
    console.log(`[OTP/SMS] ${normalizedPhone}: ${code}`);
}

export async function sendOtpByEmail(email: string, code: string) {
    await sendEmail(
        email,
        'Your SaveMyRyde OTP',
        `Your verification code is ${code}. It expires in 5 minutes.`
    );
}

export async function sendOtpByWhatsApp(phoneE164: string, code: string) {
    const client = getTwilio();
    if (!client || !TWILIO_WHATSAPP_FROM) {
        console.warn('[OTP/WA] Twilio not configured; skipping WhatsApp send');
        return;
    }
    await client.messages.create({
        from: TWILIO_WHATSAPP_FROM,
        to: `whatsapp:${phoneE164.replace(/^whatsapp:/, '')}`,
        body: `Your SaveMyRyde OTP is ${code}. It expires in 5 minutes.`
    });
}

export async function readOtp(normalizedPhone: string): Promise<string | null> {
    const redis = getRedisClient();
    return await redis.get(`otp:${normalizedPhone}`);
}