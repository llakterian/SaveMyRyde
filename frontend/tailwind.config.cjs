module.exports = {
    // Enable class-based dark mode for manual toggle; prefers-color-scheme remains default via CSS
    darkMode: 'class',
    content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
    theme: {
        extend: {
            colors: {
                // Primary brand leans Emerald
                brand: {
                    DEFAULT: '#059669', // emerald-600
                    50: '#ecfdf5',
                    100: '#d1fae5',
                    200: '#a7f3d0',
                    300: '#6ee7b7',
                    400: '#34d399',
                    500: '#10b981',
                    600: '#059669',
                    700: '#047857',
                    800: '#065f46',
                    900: '#064e3b',
                },
                // Accent leans Indigo; Info leans Cyan
                accent: { DEFAULT: '#6366f1' }, // indigo-500
                info: { DEFAULT: '#06b6d4' },   // cyan-500
            },
        },
    },
    plugins: [],
}