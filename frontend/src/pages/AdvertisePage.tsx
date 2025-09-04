import { useState } from 'react'
import axios from 'axios'

export function AdvertisePage() {
    const [listingId, setListingId] = useState('')
    const [userId, setUserId] = useState('')
    const [type, setType] = useState<'featured' | 'homepage' | 'boost'>('featured')
    const [days, setDays] = useState(7)
    const [message, setMessage] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)

    const submit = async () => {
        setMessage(null)
        setLoading(true)
        try {
            const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001'
            const res = await axios.post(`${baseUrl}/api/ads/boost`, { userId, listingId, type, days })
            setMessage(`Ad purchased: ${type}. Amount KES ${res.data.amount_kes}`)
        } catch (e: any) {
            console.error(e)
            setMessage('Failed to purchase ad')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="max-w-xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <h2 className="text-3xl font-bold mb-4">Advertise Your Listing</h2>
            <p className="text-gray-600 mb-6">Boost visibility with featured/homepage placements.</p>

            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Listing ID</label>
                    <input className="input-field mt-1" value={listingId} onChange={e => setListingId(e.target.value)} placeholder="UUID" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Phone (User ID)</label>
                    <input className="input-field mt-1" value={userId} onChange={e => setUserId(e.target.value)} placeholder="07XXXXXXXX" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Ad Type</label>
                    <select className="input-field mt-1" value={type} onChange={e => setType(e.target.value as any)}>
                        <option value="featured">Featured (KES 500)</option>
                        <option value="homepage">Homepage (KES 1500)</option>
                        <option value="boost">Boost (KES 800)</option>
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Days</label>
                    <input type="number" className="input-field mt-1" value={days} onChange={e => setDays(parseInt(e.target.value || '1', 10))} />
                </div>
                <button onClick={submit} disabled={loading} className="btn-primary">{loading ? 'Processing…' : 'Buy Ad'}</button>
                {message && <p className="mt-3 text-green-700 bg-green-50 p-3 rounded">{message}</p>}
            </div>
        </div>
    )
}