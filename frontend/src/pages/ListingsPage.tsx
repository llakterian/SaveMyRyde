import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'
import { Card } from '@/components/ui/Card'

interface Listing {
    id: string
    title: string
    price_kes: number
    min_price_kes?: number
    location: string
    images: string[]
    created_at: string
    badges?: string[]
    is_flash_deal?: boolean
    auction_deadline?: string
    verification_status?: string
}

const placeholderListings: Listing[] = [
    { id: 'ph-axio-2014', title: '2014 Toyota Axio 1.5X (Bank Repo)', price_kes: 870000, location: 'Nairobi - Industrial Area', images: [], created_at: new Date().toISOString() },
    { id: 'ph-forester-2012', title: '2012 Subaru Forester 2.0XT (Salvage - Minor Front)', price_kes: 1150000, location: 'Mombasa - Shimanzi', images: [], created_at: new Date().toISOString() },
    { id: 'ph-premio-2010', title: '2010 Toyota Premio 1.8X (Finance Recovery)', price_kes: 980000, location: 'Kiambu - Thika Road', images: [], created_at: new Date().toISOString() },
    { id: 'ph-xtrail-2013', title: '2013 Nissan X-Trail 2.0 (Repo, Clean Interior)', price_kes: 1050000, location: 'Nairobi - Embakasi', images: [], created_at: new Date().toISOString() },
    { id: 'ph-demio-2015', title: '2015 Mazda Demio 1.3 (Quick Sale)', price_kes: 650000, location: 'Kisumu - CBD', images: [], created_at: new Date().toISOString() },
    { id: 'ph-prado-2007', title: '2007 Toyota Land Cruiser Prado TX (Accident Repair)', price_kes: 2250000, location: 'Nakuru - Pipeline', images: [], created_at: new Date().toISOString() },
]

export function ListingsPage() {
    const [items, setItems] = useState<Listing[]>([])
    const [loading, setLoading] = useState(true)
    const [failed, setFailed] = useState<Set<string>>(new Set())
    const [flashOnly, setFlashOnly] = useState(false)


    // API base for fetching listings; for images prefer relative '/uploads' (proxied)
    const apiBase = useMemo(() => (import.meta.env.VITE_API_URL as string | undefined) || 'http://localhost:3001', [])

    useEffect(() => {
        const fetchData = async () => {
            try {
                const q = flashOnly ? '?flash=true' : ''
                const res = await axios.get<Listing[]>(`${apiBase}/api/listings${q}`)
                const data = Array.isArray(res.data) ? res.data : []
                setItems(data.length > 0 ? data : placeholderListings)
            } catch (e) {
                console.error(e)
                setItems(placeholderListings)
            } finally {
                setLoading(false)
            }
        }
        fetchData()
    }, [apiBase, flashOnly])

    // Probe first image with HEAD to distinguish 403 (locked) vs 404/other
    useEffect(() => {
        const controller = new AbortController()
        const run = async () => {
            const checks = items.map(async (l) => {
                const first = l.images?.[0]
                if (!first) return
                try {
                    const res = await fetch(first, { method: 'HEAD', signal: controller.signal })
                    if (!res.ok) {
                        setFailed(prev => new Set(prev).add(l.id))
                    }
                } catch {
                    setFailed(prev => new Set(prev).add(l.id))
                }
            })
            await Promise.allSettled(checks)
        }
        if (items.length) run()
        return () => controller.abort()
    }, [items])

    if (loading) return <div className="p-8">Loading…</div>

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <h2 className="text-3xl font-bold mb-6 heading-gradient">Available Cars</h2>
            <div className="mb-6 flex items-center gap-3">
                <label className="inline-flex items-center gap-2 text-sm">
                    <input type="checkbox" checked={flashOnly} onChange={e => setFlashOnly(e.target.checked)} />
                    Flash Deals only
                </label>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {items.map((l) => {
                    const first = l.images?.[0]
                    const showFallback = !first || failed.has(l.id)
                    // Keep relative path (e.g., '/uploads/abc.webp') so dev/prod proxies handle it
                    const imgSrc = first || ''
                    return (
                        <Card key={l.id} className="overflow-hidden p-0">
                            {showFallback ? (
                                <div className="relative w-full h-48 bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-slate-500 dark:text-slate-400">
                                    <span>Image pending payment</span>
                                    <span className="absolute top-2 right-2 text-[11px] px-2 py-0.5 rounded bg-amber-100 text-amber-700 border border-amber-300">Locked</span>
                                </div>
                            ) : (
                                <img
                                    src={imgSrc}
                                    alt="car"
                                    className="w-full h-48 object-cover"
                                    onError={() => setFailed(prev => new Set(prev).add(l.id))}
                                />
                            )}
                            <div className="p-4">
                                <h3 className="text-lg font-semibold">{l.title}</h3>
                                <p className="mt-1 text-slate-700 dark:text-slate-300">KES {l.price_kes.toLocaleString()}</p>
                                <p className="text-sm text-slate-500 dark:text-slate-400">{l.location}</p>
                                <Link to={`/listings/${l.id}`} className="inline-block mt-3 text-primary-600 hover:underline text-sm">View</Link>
                            </div>
                        </Card>
                    )
                })}
            </div>
        </div>
    )
}