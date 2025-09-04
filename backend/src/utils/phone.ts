// Kenyan phone validation and normalization utilities
// Acceptable inputs: +2547XXXXXXXX, +2541XXXXXXXX, 07XXXXXXXX, 01XXXXXXXX
// Normalize to +2547XXXXXXXX / +2541XXXXXXXX

export function isValidKenyanPhone(input: string): boolean {
    const s = input.trim();
    // +2547xxxxxxxx or +2541xxxxxxxx
    if (/^\+254[17]\d{8}$/.test(s)) return true;
    // 07xxxxxxxx or 01xxxxxxxx
    if (/^0[17]\d{8}$/.test(s)) return true;
    return false;
}

export function normalizeKenyanPhone(input: string): string {
    const s = input.trim();
    if (s.startsWith('+254')) return s;
    if (/^0[17]\d{8}$/.test(s)) {
        return '+254' + s.slice(1);
    }
    // Fallback: return as-is (caller should have validated)
    return s;
}