export function HomePage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 sm:text-6xl">
          Sell Your Car Privately in Kenya
        </h1>
        <p className="mt-6 text-lg leading-8 text-gray-600 max-w-2xl mx-auto">
          Avoid repossession and auction houses. List your distressed vehicle on CarRescueKe 
          and connect directly with buyers. Pay only KES 2,500 to list your car.
        </p>
        <div className="mt-10 flex items-center justify-center gap-x-6">
          <a
            href="/sell"
            className="rounded-md bg-green-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-green-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-600"
          >
            List Your Car - KES 2,500
          </a>
          <a
            href="/listings"
            className="text-sm font-semibold leading-6 text-gray-900"
          >
            Browse Cars <span aria-hidden="true">→</span>
          </a>
        </div>
      </div>

      <div className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-900">Easy Listing</h3>
          <p className="mt-2 text-gray-600">
            Upload photos, add details, and pay KES 2,500 via M-Pesa to make your listing live.
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-900">Direct Contact</h3>
          <p className="mt-2 text-gray-600">
            Buyers contact you directly. No middlemen, no auction fees.
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-900">Kenyan Focused</h3>
          <p className="mt-2 text-gray-600">
            Built for Kenya with M-Pesa payments and local phone number support.
          </p>
        </div>
      </div>
    </div>
  )
}