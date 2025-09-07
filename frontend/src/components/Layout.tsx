import { ReactNode, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ThemeToggle } from './ThemeToggle'

interface LayoutProps {
  children: ReactNode
}

export function Layout({ children }: LayoutProps) {
  const [isAdmin, setIsAdmin] = useState(false)
  const [isUser, setIsUser] = useState(false)

  useEffect(() => {
    setIsAdmin(!!localStorage.getItem('smr_admin_jwt'))
    setIsUser(!!localStorage.getItem('smr_user_jwt'))
  }, [])

  const logoutAdmin = () => {
    localStorage.removeItem('smr_admin_jwt')
    window.location.href = '/admin/login'
  }

  const logoutUser = () => {
    localStorage.removeItem('smr_user_jwt')
    window.location.href = '/'
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      <header className="sticky top-0 z-40 border-b border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/60 backdrop-blur">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold heading-gradient">
                SaveMyRyde
              </h1>
            </div>
            <nav className="hidden md:flex space-x-4 items-center">
              <Link to="/" className="nav-link">Home</Link>
              <Link to="/listings" className="nav-link">Browse Cars</Link>
              <Link to="/sell" className="nav-link">Sell Your Car</Link>
              <Link to="/advertise" className="nav-link">Advertise</Link>

              {isUser ? (
                <>
                  <Link to="/dashboard" className="nav-link">My Dashboard</Link>
                  <button onClick={logoutUser} className="nav-link">Logout</button>
                </>
              ) : (
                <Link to="/login" className="nav-link">Login</Link>
              )}

              {isAdmin && (
                <>
                  <Link to="/admin/payments" className="nav-link">Admin</Link>
                  <button onClick={logoutAdmin} className="nav-link">Admin Logout</button>
                </>
              )}

              <div className="w-px h-6 bg-slate-200 dark:bg-slate-700" />
              <ThemeToggle />
            </nav>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {children}
      </main>

      <footer className="bg-slate-900 dark:bg-slate-950 text-slate-100 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center space-y-2">
            <p>&copy; 2024 SaveMyRyde. All rights reserved.</p>
            <p className="text-sm text-slate-400">Helping Kenyans sell their vehicles privately</p>
            <p className="text-sm">
              Built by <strong>Triolink Ltd.</strong> — For a system like this, contact
              <a className="underline ml-1" href="mailto:triolinkl@gmail.com">triolinkl@gmail.com</a>
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}