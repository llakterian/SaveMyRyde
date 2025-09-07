import { ButtonHTMLAttributes, forwardRef } from 'react'
import clsx from 'clsx'

// Reusable Button component with variants
export type ButtonVariant = 'primary' | 'secondary' | 'ghost'

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: ButtonVariant
    fullWidth?: boolean
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
    ({ variant = 'primary', className, fullWidth, ...props }, ref) => {
        const base = 'inline-flex items-center justify-center rounded-md px-4 py-2.5 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed'
        const variants: Record<ButtonVariant, string> = {
            primary: 'bg-brand-600 hover:bg-brand-700 text-white focus:ring-brand-500 dark:focus:ring-offset-slate-900',
            secondary: 'bg-slate-200 hover:bg-slate-300 text-slate-900 dark:bg-slate-700 dark:hover:bg-slate-600 dark:text-slate-100 focus:ring-slate-400 dark:focus:ring-offset-slate-900',
            ghost: 'bg-transparent hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-slate-400 dark:focus:ring-offset-slate-900',
        }

        return (
            <button
                ref={ref}
                className={clsx(base, variants[variant], fullWidth && 'w-full', className)}
                {...props}
            />
        )
    }
)

Button.displayName = 'Button'