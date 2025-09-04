import { useForm } from 'react-hook-form'
import axios from 'axios'
import { useState } from 'react'

interface FormValues {
    userId: string
    title: string
    description?: string
    price_kes: number
    location: string
    images: FileList
}

export function SellPage() {
    const { register, handleSubmit, reset } = useForm<FormValues>()
    const [loading, setLoading] = useState(false)
    const [message, setMessage] = useState<string | null>(null)

    const onSubmit = async (data: FormValues) => {
        setMessage(null)
        setLoading(true)
        try {
            const form = new FormData()
            form.append('userId', data.userId)
            form.append('title', data.title)
            if (data.description) form.append('description', data.description)
            form.append('price_kes', String(data.price_kes))
            form.append('location', data.location)
            Array.from(data.images || []).forEach(f => form.append('images', f))

            const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001'

            // 1) Create listing (pending)
            const createResp = await axios.post(`${baseUrl}/api/listings`, form, {
                headers: { 'Content-Type': 'multipart/form-data' },
            })
            const listingId = createResp.data.listingId as string

            // 2) Initiate payment (simulated). On real MPesa, this would prompt STK push.
            await axios.post(`${baseUrl}/api/payments/initiate`, {
                userId: data.userId,
                listingId,
            })

            setMessage('Payment received. Your listing is now public!')
            reset()
        } catch (err: any) {
            console.error(err)
            setMessage('Failed to submit. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900">Sell Your Car</h2>
            <p className="mt-2 text-gray-600">Pay KES 2,500 to publish. Use your phone number as temporary user ID for now.</p>

            <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Phone (User ID)</label>
                    <input className="input-field mt-1" placeholder="07XXXXXXXX" {...register('userId', { required: true })} />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Title</label>
                    <input className="input-field mt-1" placeholder="e.g., 2014 Toyota Axio" {...register('title', { required: true })} />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Description</label>
                    <textarea className="input-field mt-1" rows={4} {...register('description')} />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Price (KES)</label>
                        <input type="number" className="input-field mt-1" {...register('price_kes', { required: true, valueAsNumber: true })} />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Location</label>
                        <input className="input-field mt-1" placeholder="Nairobi" {...register('location', { required: true })} />
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Photos</label>
                    <input type="file" multiple accept="image/*" className="mt-1" {...register('images')} />
                </div>

                <button type="submit" disabled={loading} className="btn-primary">
                    {loading ? 'Processing…' : 'Pay KES 2,500 & Publish'}
                </button>

                {message && (
                    <p className="mt-4 text-green-700 bg-green-50 p-3 rounded">{message}</p>
                )}
            </form>
        </div>
    )
}