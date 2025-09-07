import { useState } from 'react'
import axios from 'axios'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'

export function AdminLoginPage() {
    const [identifier, setIdentifier] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState<string | null>(null)
    const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001'

    const onLogin = async () => {
        setError(null)
        try {
            const r = await axios.post(`${baseUrl}/api/auth/login`, { identifier, password })
            const { token } = r.data
            // store token for admin pages
            localStorage.setItem('smr_admin_jwt', token)
            window.location.href = '/admin/dashboard'
        } catch (e: any) {
            setError(e?.response?.data?.error || 'Login failed')
        }
    }

    return (
        <div className="max-w-md mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <h2 className="text-2xl font-semibold heading-gradient">Admin Login</h2>
            <Card className="mt-4">
                <div className="space-y-3">
                    <input className="input-field w-full" placeholder="Email or phone" value={identifier} onChange={e => setIdentifier(e.target.value)} />
                    <input className="input-field w-full" type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} />
                    {error && <div className="text-red-600 text-sm">{error}</div>}
                    <Button fullWidth onClick={onLogin}>Login</Button>
                </div>
            </Card>
        </div>
    )
}