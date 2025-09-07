import { useState } from 'react'
import axios from 'axios'
import { Button } from '@/components/ui/Button'

export function LoginPage() {
    const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001'
    const [phone, setPhone] = useState('')
    const [email, setEmail] = useState('')
    const [method, setMethod] = useState<'sms' | 'email' | 'whatsapp'>('sms')
    const [code, setCode] = useState('')
    const [stage, setStage] = useState<'request' | 'verify'>('request')
    const [msg, setMsg] = useState<string | null>(null)
    const [err, setErr] = useState<string | null>(null)

    const requestOtp = async () => {
        setErr(null); setMsg(null)
        try {
            await axios.post(`${baseUrl}/api/auth/otp/request`, { phone, method, email: method === 'email' ? email : undefined })
            setStage('verify')
            setMsg(method === 'sms' ? 'OTP sent via SMS.' : method === 'email' ? 'OTP sent to your email.' : 'OTP sent via WhatsApp.')
        } catch (e: any) {
            setErr(e?.response?.data?.error || 'Failed to request OTP')
        }
    }

    const verifyOtp = async () => {
        setErr(null); setMsg(null)
        try {
            const r = await axios.post(`${baseUrl}/api/auth/otp/verify`, { phone, code })
            const { token } = r.data
            localStorage.setItem('smr_user_jwt', token)
            window.location.href = '/dashboard'
        } catch (e: any) {
            setErr(e?.response?.data?.error || 'Failed to verify OTP')
        }
    }

    return (
        <div className="max-w-md mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <h2 className="text-2xl font-semibold">Login</h2>

            {stage === 'request' && (
                <div className="mt-4 space-y-3">
                    <input className="input-field w-full" placeholder="Phone (e.g. 07XXXXXXXX or 01XXXXXXXX)" value={phone} onChange={e => setPhone(e.target.value)} />

                    <div className="flex items-center gap-3">
                        <label className="flex items-center gap-2 text-sm">
                            <input type="radio" name="method" checked={method === 'sms'} onChange={() => setMethod('sms')} /> SMS
                        </label>
                        <label className="flex items-center gap-2 text-sm">
                            <input type="radio" name="method" checked={method === 'email'} onChange={() => setMethod('email')} /> Email
                        </label>
                        <label className="flex items-center gap-2 text-sm">
                            <input type="radio" name="method" checked={method === 'whatsapp'} onChange={() => setMethod('whatsapp')} /> WhatsApp
                        </label>
                    </div>

                    {method === 'email' && (
                        <input className="input-field w-full" placeholder="Email address" value={email} onChange={e => setEmail(e.target.value)} />
                    )}

                    {err && <div className="text-red-600 text-sm">{err}</div>}
                    {msg && <div className="text-emerald-700 dark:text-emerald-300 text-sm">{msg}</div>}
                    <Button fullWidth onClick={requestOtp}>Send OTP</Button>
                </div>
            )}

            {stage === 'verify' && (
                <div className="mt-4 space-y-3">
                    <input className="input-field w-full" placeholder="Enter OTP" value={code} onChange={e => setCode(e.target.value)} />
                    {err && <div className="text-red-600 text-sm">{err}</div>}
                    {msg && <div className="text-emerald-700 dark:text-emerald-300 text-sm">{msg}</div>}
                    <Button fullWidth onClick={verifyOtp}>Verify</Button>
                </div>
            )}
        </div>
    )
}