export function HomePage() {
  return (
    <div className="relative">
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-slate-50 to-white dark:from-slate-950 dark:to-slate-900" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <h1 className="text-4xl sm:text-6xl font-extrabold leading-tight">
            <span className="heading-gradient">SaveMyRyde</span>
          </h1>
          <p className="text-xl font-medium text-orange-600 dark:text-orange-400 mt-2">
            Sell Fast, Save Your Ride.
          </p>
          <p className="mt-6 text-lg leading-8 text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
            Connect with buyers and avoid repossession. Get your RideSafe Pass for KES 5,000
            and unlock priority listing, verification badges, and exclusive benefits.
          </p>
          <div className="mt-10 flex items-center justify-center gap-x-4">
            <a href="/sell" className="btn-primary">
              Get RideSafe Pass - KES 5,000
            </a>
            <a href="/listings" className="btn-secondary">
              Browse Deals →
            </a>
          </div>
        </div>

        <div className="mt-16 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <div className="card p-6">
            <div className="text-2xl mb-3">🔒</div>
            <h3 className="text-lg font-semibold">RideSafe Pass Benefits</h3>
            <p className="mt-2 text-slate-600 dark:text-slate-300">
              Priority listing, RideSafe Badge, free valuation report, and social sharing tools included.
            </p>
          </div>
          <div className="card p-6">
            <div className="text-2xl mb-3">⚡</div>
            <h3 className="text-lg font-semibold">DealStar Challenge</h3>
            <p className="mt-2 text-slate-600 dark:text-slate-300">
              Buyers compete for best deals. Earn points, win prizes, and climb leaderboards.
            </p>
          </div>
          <div className="card p-6">
            <div className="text-2xl mb-3">🏆</div>
            <h3 className="text-lg font-semibold">Community Trust</h3>
            <p className="mt-2 text-slate-600 dark:text-slate-300">
              Verified listings, community champions, and RideSafe Guarantee for safe transactions.
            </p>
          </div>
        </div>

        {/* Flash Deals Section */}
        <div className="mt-16 bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-950/20 dark:to-orange-950/20 rounded-2xl p-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-red-600 dark:text-red-400">⚡ Flash Deals</h2>
            <p className="mt-4 text-lg text-slate-600 dark:text-slate-300">
              Time-limited offers with urgent deadlines. No DealStar fee required!
            </p>
            <div className="mt-6">
              <a href="/listings?filter=flash" className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-lg inline-flex items-center">
                View Flash Deals
                <span className="ml-2">🔥</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}