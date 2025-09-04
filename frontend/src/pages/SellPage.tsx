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
    const [createdListingId, setCreatedListingId] = useState<string | null>(null)
    const [mpesaCode, setMpesaCode] = useState('')

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
            setCreatedListingId(listingId)
            setMessage('Listing created. Pay KES 2,500 to Loop Bank Paybill 714777 (Account 0101355308), then enter your M-Pesa code below for verification.')
        } catch (err: any) {
            console.error(err)
            setMessage('Failed to create listing. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    const submitManualCode = async (userPhone: string) => {
        if (!createdListingId || !mpesaCode) {
            setMessage('Provide the M-Pesa code to continue.')
            return
        }
        setLoading(true)
        try {
            const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001'
            await axios.post(`${baseUrl}/api/payments/manual/claim`, {
                userId: userPhone,
                listingId: createdListingId,
                mpesaCode,
            })
            setMessage('Payment claim submitted. Admin will verify and publish your listing shortly.')
            setMpesaCode('')
        } catch (e) {
            console.error(e)
            setMessage('Failed to submit payment code. Try again.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900">Sell Your Car</h2>
            <p className="mt-2 text-gray-600">Pay KES 2,500 to the Loop Bank Paybill to publish. Use your phone number as your account ID.</p>

            <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Phone (User ID)</label>
                    <input name="userId" className="input-field mt-1" placeholder="07XXXXXXXX" {...register('userId', { required: true })} />
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
                    {loading ? 'Processing…' : 'Create Listing'}
                </button>
            </form>

            {createdListingId && (
                <div className="mt-10 p-4 bg-yellow-50 border border-yellow-200 rounded">
                    <h3 className="font-semibold text-yellow-900">Next step: Pay and submit your M-Pesa code</h3>
                    <ol className="list-decimal ml-5 text-sm text-yellow-900 mt-2 space-y-1">
                        <li>Pay <strong>KES 2,500</strong> to the Loop Bank Paybill using your phone.</li>
                        <li>After payment, enter the received M-Pesa confirmation code below.</li>
                        <li>We’ll verify and publish your listing.</li>
                    </ol>
                    <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <input className="input-field sm:col-span-2" placeholder="M-Pesa code (e.g., QFT12ABC34)" value={mpesaCode} onChange={e => setMpesaCode(e.target.value)} />
                        <button className="btn-primary" disabled={loading || !mpesaCode} onClick={() => submitManualCode((document.querySelector('input[name="userId"]') as HTMLInputElement)?.value)}>
                            {loading ? 'Submitting…' : 'Submit Code'}
                        </button>
                    </div>
                </div>
            )}

            {message && (
                <p className="mt-4 text-green-700 bg-green-50 p-3 rounded">{message}</p>
            )}
        </div>
    )
}