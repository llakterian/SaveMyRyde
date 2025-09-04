import { ReactNode } from 'react'

interface LayoutProps {
  children: ReactNode
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-green-600">
                CarRescueKe
              </h1>
            </div>
            <nav className="hidden md:flex space-x-8">
              <a href="/" className="text-gray-700 hover:text-green-600">
                Home
              </a>
              <a href="/listings" className="text-gray-700 hover:text-green-600">
                Browse Cars
              </a>
              <a href="/sell" className="text-gray-700 hover:text-green-600">
                Sell Your Car
              </a>
              <a href="/advertise" className="text-gray-700 hover:text-green-600">
                Advertise
              </a>
              <a href="/login" className="text-gray-700 hover:text-green-600">
                Login
              </a>
            </nav>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {children}
      </main>

      <footer className="bg-gray-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <p>&copy; 2024 CarRescueKe. All rights reserved.</p>
            <p className="text-sm text-gray-400 mt-2">
              Helping Kenyans sell their vehicles privately
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}