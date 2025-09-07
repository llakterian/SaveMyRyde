import nodemailer from 'nodemailer';

const {
    SMTP_HOST,
    SMTP_PORT,
    SMTP_USER,
    SMTP_PASS,
    FROM_EMAIL
} = process.env as Record<string, string | undefined>;

let transporter: nodemailer.Transporter | null = null;

export function getMailer() {
    if (transporter) return transporter;
    if (!SMTP_HOST || !SMTP_PORT) {
        console.warn('[MAILER] SMTP not configured; emails will be skipped');
        return null;
    }
    transporter = nodemailer.createTransport({
        host: SMTP_HOST,
        port: Number(SMTP_PORT),
        secure: Number(SMTP_PORT) === 465, // true for 465, false for others
        auth: SMTP_USER && SMTP_PASS ? { user: SMTP_USER, pass: SMTP_PASS } : undefined,
    });
    return transporter;
}

export async function sendEmail(to: string, subject: string, text: string, html?: string) {
    const mailer = getMailer();
    if (!mailer) {
        console.log(`[MAILER] Would send email to ${to}: ${subject} -> ${text}`);
        return;
    }
    const from = FROM_EMAIL || 'no-reply@carrescue.ke';
    await mailer.sendMail({ from, to, subject, text, html: html || text });
}