import { Link } from 'react-router-dom'

export function NotFoundPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
      <div className="text-center">
        <h1 className="text-6xl font-extrabold heading-gradient">404</h1>
        <p className="mt-4 text-xl text-slate-700 dark:text-slate-300">Page not found</p>
        <Link
          to="/"
          className="mt-6 inline-block btn-primary"
        >
          Go back home
        </Link>
      </div>
    </div>
  )
}