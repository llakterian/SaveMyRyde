import { useEffect, useState } from 'react'
import axios from 'axios'

interface User {
    id: string
    name: string
    email: string | null
    phone: string | null
    role: string
}

export function AdminUsersPage() {
    const [users, setUsers] = useState<User[]>([])
    const [loading, setLoading] = useState(true)
    const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001'

    const authHeaders = () => {
        const token = localStorage.getItem('smr_admin_jwt')
        return token ? { Authorization: `Bearer ${token}` } : {}
    }

    const handleAuthError = (e: any) => {
        if (e?.response?.status === 401 || e?.response?.status === 403) {
            window.location.href = '/admin/login'
        }
    }

    const fetchUsers = async () => {
        setLoading(true)
        try {
            const r = await axios.get<User[]>(`${baseUrl}/api/admin/users`, { headers: authHeaders() })
            setUsers(r.data)
        } catch (e) {
            handleAuthError(e)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => { fetchUsers() }, [])

    return (
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <div className="flex items-center gap-3 mb-6">
                <h2 className="text-2xl font-semibold">Admin: All Users</h2>
                <span className="px-2 py-1 text-xs rounded bg-purple-100 text-purple-700 border border-purple-200">You're admin</span>
            </div>

            <div className="mb-4 flex gap-2">
                <button className="btn-secondary" onClick={fetchUsers}>Refresh</button>
                <a href="/admin/payments" className="btn-secondary">Payments</a>
            </div>

            {loading ? <div className="mt-6">Loading…</div> : (
                <div className="mt-6 space-y-3">
                    {users.length === 0 && <div className="text-gray-500">No users found</div>}
                    {users.map(user => (
                        <div key={user.id} className="border rounded p-4 flex items-center justify-between">
                            <div>
                                <div className="font-medium">{user.name}</div>
                                <div className="text-sm text-gray-600">
                                    Email: {user.email || 'N/A'} • Phone: {user.phone || 'N/A'}
                                </div>
                                <div className="text-sm text-gray-500">Role: {user.role}</div>
                            </div>
                            <div className="text-sm text-gray-400">ID: {user.id}</div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
