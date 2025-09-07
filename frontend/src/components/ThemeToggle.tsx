import { useEffect, useState } from 'react'

function getInitialTheme(): 'light' | 'dark' {
    try {
        const stored = localStorage.getItem('theme') as 'light' | 'dark' | null
        if (stored === 'light' || stored === 'dark') return stored
        return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
    } catch {
        return 'light'
    }
}

export function ThemeToggle() {
    const [theme, setTheme] = useState<'light' | 'dark'>(getInitialTheme())

    useEffect(() => {
        const isDark = theme === 'dark'
        document.documentElement.classList.toggle('dark', isDark)
        try {
            localStorage.setItem('theme', theme)
        } catch { }
    }, [theme])

    return (
        <button
            type="button"
            aria-label="Toggle theme"
            className="inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-900 dark:text-slate-100 transition-colors"
            onClick={() => setTheme(t => (t === 'dark' ? 'light' : 'dark'))}
            title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
        >
            {theme === 'dark' ? (
                <>
                    <span>🌙</span> Dark
                </>
            ) : (
                <>
                    <span>☀️</span> Light
                </>
            )}
        </button>
    )
}