import { useEffect, useState } from 'react'
import axios from 'axios'

interface StatusData {
    message: string
    users: number
    listings: number
}

export function AdminDashboardPage() {
    const [status, setStatus] = useState<StatusData | null>(null)
    const [loading, setLoading] = useState(true)
    const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001'

    const authHeaders = () => {
        const token = localStorage.getItem('smr_admin_jwt')
        return token ? { Authorization: `Bearer ${token}` } : {}
    }

    const fetchStatus = async () => {
        setLoading(true)
        try {
            const r = await axios.get<StatusData>(`${baseUrl}/api/admin/status`, { headers: authHeaders() })
            setStatus(r.data)
        } catch (e) {
            setStatus({ message: 'Failed to fetch status', users: 0, listings: 0 })
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchStatus()
    }, [])

    return (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <div className="flex items-center gap-3 mb-6">
                <h2 className="text-2xl font-semibold">Admin Dashboard</h2>
                <span className="px-2 py-1 text-xs rounded bg-purple-100 text-purple-700 border border-purple-200">You're admin</span>
            </div>

            {loading ? <div>Loading...</div> : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-white p-6 rounded-lg shadow">
                        <h3 className="text-lg font-medium text-gray-900">App Status</h3>
                        <p className="text-2xl font-bold text-green-600">{status?.message}</p>
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow">
                        <h3 className="text-lg font-medium text-gray-900">Total Users</h3>
                        <p className="text-2xl font-bold text-blue-600">{status?.users}</p>
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow">
                        <h3 className="text-lg font-medium text-gray-900">Total Listings</h3>
                        <p className="text-2xl font-bold text-orange-600">{status?.listings}</p>
                    </div>
                </div>
            )}

            <div className="space-x-4">
                <a href="/admin/users" className="btn-primary">Manage Users</a>
                <a href="/admin/payments" className="btn-primary">Manage Payments</a>
                <a href="/admin/login" className="btn-secondary">Logout</a>
            </div>
        </div>
    )
}
