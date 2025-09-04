import { useForm } from 'react-hook-form'
import axios from 'axios'
import { useEffect, useMemo, useState } from 'react'

interface FormValues {
    userId: string
    title: string
    description?: string
    price_kes: number
    location?: string
    county?: string
    town?: string
    seller_id_number?: string
    kra_pin?: string
    images: FileList
}

function isValidPhoneKE(p: string) {
    const s = (p || '').trim()
    return /^\+254[17]\d{8}$/.test(s) || /^0[17]\d{8}$/.test(s)
}

export function SellPage() {
    const { register, handleSubmit } = useForm<FormValues>()
    const [loading, setLoading] = useState(false)
    const [message, setMessage] = useState<string | null>(null)
    const [createdListingId, setCreatedListingId] = useState<string | null>(null)
    const [mpesaCode, setMpesaCode] = useState('')
    const [airtelRef, setAirtelRef] = useState('')
    const [payMethod, setPayMethod] = useState<'mpesa' | 'airtel'>('mpesa')
    const [userPhone, setUserPhone] = useState('')
    const [role, setRole] = useState<'buyer' | 'seller' | 'admin' | null>(null)
    const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001'

    useEffect(() => {
        const token = localStorage.getItem('crk_user_jwt')
        if (!token) return
        axios.get(`${baseUrl}/api/me/profile`, { headers: { Authorization: `Bearer ${token}` } })
            .then(r => {
                setRole(r.data?.role)
                if (r.data?.phone) setUserPhone(r.data.phone)
            })
            .catch(() => setRole(null))
    }, [])

    const onSubmit = async (data: FormValues) => {
        setMessage(null)
        setLoading(true)
        try {
            const form = new FormData()
            const phone = userPhone || data.userId
            if (!isValidPhoneKE(phone)) {
                setMessage('Enter a valid Kenyan phone (+2547XXXXXXXX or 07XXXXXXXX / 01XXXXXXXX).')
                setLoading(false)
                return
            }
            form.append('userId', phone)
            form.append('title', data.title)
            if (data.description) form.append('description', data.description)
            form.append('price_kes', String(data.price_kes))
            if (data.location) form.append('location', data.location)
            if (data.county) form.append('county', data.county)
            if (data.town) form.append('town', data.town)
            if (data.seller_id_number) form.append('seller_id_number', data.seller_id_number)
            if (data.kra_pin) form.append('kra_pin', data.kra_pin)
            Array.from(data.images || []).forEach(f => form.append('images', f))

            // 1) Create listing (pending)
            const createResp = await axios.post(`${baseUrl}/api/listings`, form, {
                headers: { 'Content-Type': 'multipart/form-data' },
            })
            const listingId = createResp.data.listingId as string
            setCreatedListingId(listingId)
            setMessage('Listing created. Pay KES 2,500 to Loop Bank Paybill 714777 (Account 0101355308), then enter your M-Pesa code below for verification.')
        } catch (err: any) {
            console.error(err)
            setMessage(err?.response?.data?.error || 'Failed to create listing. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    const submitManualCode = async (userPhone: string) => {
        if (!createdListingId) return
        if (payMethod === 'mpesa' && !mpesaCode) {
            setMessage('Provide the M-Pesa code to continue.')
            return
        }
        if (payMethod === 'airtel' && !airtelRef) {
            setMessage('Provide the Airtel reference to continue.')
            return
        }
        setLoading(true)
        try {
            if (payMethod === 'mpesa') {
                await axios.post(`${baseUrl}/api/payments/manual/claim`, {
                    userId: userPhone,
                    listingId: createdListingId,
                    mpesaCode,
                })
            } else {
                await axios.post(`${baseUrl}/api/airtel/manual/claim`, {
                    userId: userPhone,
                    listingId: createdListingId,
                    airtelRef,
                })
            }
            setMessage('Payment claim submitted. Admin will verify and publish your listing shortly.')
            setMpesaCode('')
            setAirtelRef('')
        } catch (e) {
            console.error(e)
            setMessage('Failed to submit payment claim. Try again.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900">Sell Your Car</h2>
            <p className="mt-2 text-gray-600">Pay KES 2,500 to the Loop Bank Paybill to publish. Use your phone number as your account ID.</p>

            {role === 'buyer' && (
                <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
                    <div className="font-medium">You are currently a buyer.</div>
                    <div className="text-sm">Once you create your first listing, we will upgrade your account to seller automatically.</div>
                </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Phone (User ID)</label>
                    <input name="userId" className="input-field mt-1" placeholder="07XXXXXXXX" defaultValue={userPhone} disabled={!!userPhone} {...register('userId', { required: true })} />
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
                        <input className="input-field mt-1" placeholder="Nairobi" {...register('location')} />
                        <div className="text-xs text-gray-500 mt-1">Optional if you provide county + town.</div>
                    </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">County</label>
                        <input className="input-field mt-1" placeholder="e.g., Nairobi County" {...register('county')} />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Town</label>
                        <input className="input-field mt-1" placeholder="e.g., Westlands" {...register('town')} />
                    </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Seller ID Number</label>
                        <input className="input-field mt-1" placeholder="(optional)" {...register('seller_id_number')} />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">KRA PIN</label>
                        <input className="input-field mt-1" placeholder="(optional)" {...register('kra_pin')} />
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
                    <h3 className="font-semibold text-yellow-900">Next step: Pay and submit your code</h3>
                    <ol className="list-decimal ml-5 text-sm text-yellow-900 mt-2 space-y-1">
                        <li>Pay <strong>KES 2,500</strong> to Loop Bank Paybill 714777 (Account 0101355308) or via Airtel Money.</li>
                        <li>After payment, choose method and enter the confirmation code/reference.</li>
                        <li>We’ll verify and publish your listing.</li>
                    </ol>
                    <div className="mt-4 flex gap-3">
                        <button type="button" className={`px-3 py-2 rounded border ${payMethod === 'mpesa' ? 'bg-green-600 text-white' : 'bg-white'}`} onClick={() => setPayMethod('mpesa')}>M-Pesa</button>
                        <button type="button" className={`px-3 py-2 rounded border ${payMethod === 'airtel' ? 'bg-red-600 text-white' : 'bg-white'}`} onClick={() => setPayMethod('airtel')}>Airtel Money</button>
                    </div>
                    {payMethod === 'mpesa' ? (
                        <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
                            <input className="input-field sm:col-span-2" placeholder="M-Pesa code (e.g., QFT12ABC34)" value={mpesaCode} onChange={e => setMpesaCode(e.target.value)} />
                            <button className="btn-primary" disabled={loading || !mpesaCode} onClick={() => submitManualCode(userPhone || (document.querySelector('input[name="userId"]') as HTMLInputElement)?.value)}>
                                {loading ? 'Submitting…' : 'Submit Code'}
                            </button>
                        </div>
                    ) : (
                        <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
                            <input className="input-field sm:col-span-2" placeholder="Airtel Money reference" value={airtelRef} onChange={e => setAirtelRef(e.target.value)} />
                            <button className="btn-primary" disabled={loading || !airtelRef} onClick={() => submitManualCode(userPhone || (document.querySelector('input[name="userId"]') as HTMLInputElement)?.value)}>
                                {loading ? 'Submitting…' : 'Submit Reference'}
                            </button>
                        </div>
                    )}
                </div>
            )}

            {message && (
                <p className="mt-4 text-green-700 bg-green-50 p-3 rounded">{message}</p>
            )}
        </div>
    )
}