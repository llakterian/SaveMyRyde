import { useEffect, useState } from 'react'
import axios from 'axios'

interface PaymentRow {
    id: string
    user_id: string
    listing_id: string
    amount_kes: number
    status: string
    provider: string
    provider_ref: string
    created_at: string
}

export function AdminPaymentsPage() {
    const [rows, setRows] = useState<PaymentRow[]>([])
    const [loading, setLoading] = useState(true)
    const [code, setCode] = useState('')
    const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001'

    const fetchPending = async () => {
        setLoading(true)
        try {
            const r = await axios.get<PaymentRow[]>(`${baseUrl}/api/payments/pending`)
            setRows(r.data)
        } finally {
            setLoading(false)
        }
    }

    const searchByCode = async () => {
        if (!code) return
        setLoading(true)
        try {
            const r = await axios.get(`${baseUrl}/api/payments/search`, { params: { code } })
            setRows(r.data ? [r.data] : [])
        } catch (e) {
            setRows([])
        } finally {
            setLoading(false)
        }
    }

    const verify = async (paymentId: string, approve: boolean) => {
        await axios.post(`${baseUrl}/api/payments/manual/verify`, { paymentId, approve })
        await fetchPending()
    }

    useEffect(() => { fetchPending() }, [])

    return (
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <h2 className="text-2xl font-semibold">Admin: Manual Payments</h2>

            <div className="mt-4 flex gap-2">
                <input className="input-field" placeholder="Search by code/reference" value={code} onChange={e => setCode(e.target.value)} />
                <button className="btn-primary" onClick={searchByCode}>Search</button>
                <button className="btn-secondary" onClick={fetchPending}>Refresh Pending</button>
            </div>

            {loading ? <div className="mt-6">Loading…</div> : (
                <div className="mt-6 space-y-3">
                    {rows.length === 0 && <div className="text-gray-500">No results</div>}
                    {rows.map(p => (
                        <div key={p.id} className="border rounded p-3 flex items-center justify-between">
                            <div>
                                <div className="text-sm text-gray-600">{new Date(p.created_at).toLocaleString()}</div>
                                <div className="font-medium">Provider: {p.provider} — Ref: {p.provider_ref || '-'}</div>
                                <div>User: {p.user_id} • Listing: {p.listing_id} • Amount: KES {p.amount_kes}</div>
                            </div>
                            <div className="flex gap-2">
                                <button className="px-3 py-2 rounded bg-green-600 text-white" onClick={() => verify(p.id, true)}>Approve</button>
                                <button className="px-3 py-2 rounded bg-gray-200" onClick={() => verify(p.id, false)}>Reject</button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}