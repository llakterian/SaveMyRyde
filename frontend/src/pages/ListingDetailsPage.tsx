import { useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import axios from 'axios'

interface Offer {
    id: string
    amount_kes: number
    type: 'offer' | 'bid'
    status: string
    created_at: string
}

interface Listing {
    id: string
    title: string
    description?: string
    price_kes: number
    min_price_kes?: number
    location: string
    images: string[]
    is_flash_deal?: boolean
    auction_deadline?: string
    offers?: Offer[]
}

export function ListingDetailsPage() {
    const { id } = useParams()
    const apiBase = useMemo(() => (import.meta.env.VITE_API_URL as string | undefined) || 'http://localhost:3001', [])
    const [listing, setListing] = useState<Listing | null>(null)
    const [loading, setLoading] = useState(true)
    const [offerAmount, setOfferAmount] = useState('')
    const [message, setMessage] = useState<string | null>(null)

    useEffect(() => {
        if (!id) return
        let es: EventSource | null = null
        const load = async () => {
            try {
                const res = await axios.get(`${apiBase}/api/listings/${id}`)
                setListing(res.data)
            } finally {
                setLoading(false)
            }
        }
        load()

        // SSE for real-time offers
        es = new EventSource(`${apiBase}/api/listings/${id}/events`)
        es.onmessage = (ev) => {
            try {
                const { event, data } = JSON.parse(ev.data)
                if (event === 'offer_created') {
                    setListing(prev => prev ? { ...prev, offers: [data, ...(prev.offers || [])] } : prev)
                }
            } catch { }
        }
        es.onerror = () => { /* ignore transient */ }

        return () => { es?.close() }
    }, [id, apiBase])

    const submitOffer = async () => {
        if (!id) return
        const buyer_id = localStorage.getItem('smr_user_phone') || ''
        const amt = parseInt(offerAmount || '0', 10)
        if (!buyer_id || !amt) { setMessage('Login with phone OTP and enter amount.'); return }
        try {
            await axios.post(`${apiBase}/api/listings/${id}/offers`, { buyer_id, amount_kes: amt, type: 'offer' })
            setOfferAmount('')
            setMessage('Offer submitted')
        } catch (e: any) {
            setMessage(e?.response?.data?.error || 'Failed to submit offer')
        }
    }

    if (loading) return <div className="p-8">Loading…</div>
    if (!listing) return <div className="p-8">Not found</div>

    const first = listing.images?.[0]

    return (
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <h1 className="text-2xl font-bold">{listing.title}</h1>
            <p className="text-slate-600 dark:text-slate-300">KES {listing.price_kes.toLocaleString()} • {listing.location}</p>
            {listing.is_flash_deal && <span className="inline-block mt-2 text-xs px-2 py-0.5 bg-rose-100 text-rose-700 rounded border border-rose-200">Flash Deal</span>}
            {listing.auction_deadline && <div className="mt-2 text-sm text-amber-700">Auction deadline: {new Date(listing.auction_deadline).toLocaleString()}</div>}

            {first ? (
                <img src={first} alt="car" className="mt-4 w-full max-h-[380px] object-cover rounded" />
            ) : (
                <div className="mt-4 w-full h-64 bg-slate-200 dark:bg-slate-800 rounded flex items-center justify-center text-slate-500">Image pending</div>
            )}

            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2">
                    <h2 className="text-lg font-semibold">Details</h2>
                    <p className="mt-2 whitespace-pre-wrap">{listing.description || '—'}</p>

                    <h3 className="mt-6 text-md font-semibold">Recent offers</h3>
                    <ul className="mt-2 space-y-2">
                        {(listing.offers || []).map(o => (
                            <li key={o.id} className="text-sm flex items-center justify-between border rounded p-2">
                                <span>KES {o.amount_kes.toLocaleString()} • {o.type}</span>
                                <span className="text-xs text-slate-500">{new Date(o.created_at).toLocaleString()}</span>
                            </li>
                        ))}
                        {!listing.offers?.length && <li className="text-sm text-slate-500">No offers yet.</li>}
                    </ul>
                </div>
                <div>
                    <div className="border rounded p-4">
                        <h3 className="font-semibold">Place an offer</h3>
                        {listing.min_price_kes && <div className="text-xs text-slate-500">Min acceptable: KES {listing.min_price_kes.toLocaleString()}</div>}
                        <input type="number" className="input-field mt-2" placeholder="Amount (KES)" value={offerAmount} onChange={(e) => setOfferAmount(e.target.value)} />
                        <button className="btn-primary mt-3 w-full" onClick={submitOffer}>Submit Offer</button>
                        {message && <div className="mt-2 text-emerald-700 text-sm">{message}</div>}
                    </div>
                </div>
            </div>
        </div>
    )
}