import { useEffect, useState } from 'react'
import axios from 'axios'

interface Listing {
    id: string
    title: string
    price_kes: number
    location: string
    images: string[]
    created_at: string
}

export function ListingsPage() {
    const [items, setItems] = useState<Listing[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchData = async () => {
            try {
                const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001'
                const res = await axios.get<Listing[]>(`${baseUrl}/api/listings`)
                setItems(res.data)
            } catch (e) {
                console.error(e)
            } finally {
                setLoading(false)
            }
        }
        fetchData()
    }, [])

    if (loading) return <div className="p-8">Loading…</div>

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <h2 className="text-3xl font-bold mb-6">Available Cars</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {items.map((l) => (
                    <div key={l.id} className="bg-white rounded-lg shadow-sm border overflow-hidden">
                        {l.images?.[0] ? (
                            <img src={l.images[0]} className="w-full h-48 object-cover" />
                        ) : (
                            <div className="w-full h-48 bg-gray-200" />
                        )}
                        <div className="p-4">
                            <h3 className="text-lg font-semibold">{l.title}</h3>
                            <p className="mt-1 text-gray-700">KES {l.price_kes.toLocaleString()}</p>
                            <p className="text-sm text-gray-500">{l.location}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}