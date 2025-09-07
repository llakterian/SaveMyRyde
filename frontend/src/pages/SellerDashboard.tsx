import { useEffect, useState } from 'react'
import axios from 'axios'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'

interface Listing {
    id: string
    title: string
    status: string
    price_kes: number
    location: string
    images: string[]
    created_at: string
    updated_at: string
    expires_at: string | null
}

interface PaymentRow {
    id: string
    listing_id: string
    amount_kes: number
    status: string
    provider: string
    provider_ref: string
    created_at: string
}

export function SellerDashboard() {
    const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001'
    const [listings, setListings] = useState<Listing[]>([])
    const [payments, setPayments] = useState<PaymentRow[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [profile, setProfile] = useState<{ role: string } | null>(null)

    const authHeaders = () => {
        const token = localStorage.getItem('smr_user_jwt')
        return token ? { Authorization: `Bearer ${token}` } : {}
    }

    const handleAuthError = (e: any) => {
        if (e?.response?.status === 401 || e?.response?.status === 403) {
            window.location.href = '/login'
        }
    }

    const load = async () => {
        setLoading(true)
        setError(null)
        try {
            const [prof, l, p] = await Promise.all([
                axios.get(`${baseUrl}/api/me/profile`, { headers: authHeaders() }),
                axios.get<Listing[]>(`${baseUrl}/api/me/listings`, { headers: authHeaders() }),
                axios.get<PaymentRow[]>(`${baseUrl}/api/me/payments`, { headers: authHeaders() }),
            ])
            setProfile(prof.data)
            setListings(l.data)
            setPayments(p.data)
        } catch (e: any) {
            setError(e?.response?.data?.error || 'Failed to load')
            handleAuthError(e)
        } finally {
            setLoading(false)
        }
    }

    const extend = async (id: string) => {
        try {
            await axios.post(`${baseUrl}/api/me/listings/${id}/extend`, {}, { headers: authHeaders() })
            await load()
        } catch (e) {
            handleAuthError(e)
        }
    }

    const promote = async () => {
        try {
            await axios.post(`${baseUrl}/api/me/promote-to-seller`, {}, { headers: authHeaders() })
            await load()
        } catch (e) {
            handleAuthError(e)
        }
    }

    useEffect(() => { load() }, [])

    return (
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <h2 className="text-2xl font-semibold heading-gradient">My Dashboard</h2>
            {loading ? <div className="mt-4">Loading…</div> : (
                <>
                    {error && <div className="text-red-600 text-sm mt-2">{error}</div>}

                    {profile && profile.role === 'buyer' && (
                        <Card className="mt-4">
                            <div className="font-medium">You are currently a buyer.</div>
                            <div className="text-sm text-slate-600 dark:text-slate-300">Promote to seller to create and manage listings.</div>
                            <Button className="mt-3" onClick={promote}>Promote to Seller</Button>
                        </Card>
                    )}

                    <div className="mt-8">
                        <h3 className="text-xl font-semibold">My Listings</h3>
                        <div className="mt-3 space-y-3">
                            {listings.length === 0 && <div className="text-slate-500 dark:text-slate-400">No listings yet</div>}
                            {listings.map(li => (
                                <Card key={li.id}>
                                    <div className="font-medium">{li.title}</div>
                                    <div className="text-sm text-slate-600 dark:text-slate-300">Status: {li.status} • Price: KES {li.price_kes} • Location: {li.location}</div>
                                    {li.expires_at && <div className="text-sm">Expires: {new Date(li.expires_at).toLocaleString()}</div>}
                                    {li.status === 'active' && (
                                        <Button variant="secondary" className="mt-2" onClick={() => extend(li.id)}>Extend 30 days</Button>
                                    )}
                                </Card>
                            ))}
                        </div>
                    </div>

                    <div className="mt-10">
                        <h3 className="text-xl font-semibold">Payment Claims</h3>
                        <div className="mt-3 space-y-3">
                            {payments.length === 0 && <div className="text-slate-500 dark:text-slate-400">No payments</div>}
                            {payments.map(p => (
                                <Card key={p.id}>
                                    <div className="text-sm text-slate-600 dark:text-slate-300">{new Date(p.created_at).toLocaleString()}</div>
                                    <div>Listing: {p.listing_id} • Amount: KES {p.amount_kes} • Status: {p.status}</div>
                                    <div className="text-sm">Ref: {p.provider_ref || '-'} ({p.provider})</div>
                                </Card>
                            ))}
                        </div>
                    </div>
                </>
            )}
        </div>
    )
}