import { HTMLAttributes, forwardRef } from 'react'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  title?: string
  subtitle?: string
  actions?: React.ReactNode
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ title, subtitle, actions, children, className = '', ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={`bg-white rounded-xl shadow-sm border border-slate-200 ${className}`}
        {...props}
      >
        {(title || actions) && (
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200">
            <div>
              {title && <h3 className="font-semibold text-slate-900">{title}</h3>}
              {subtitle && <p className="text-sm text-slate-500">{subtitle}</p>}
            </div>
            {actions && <div className="flex items-center gap-2">{actions}</div>}
          </div>
        )}
        <div className="p-4">
          {children}
        </div>
      </div>
    )
  }
)

Card.displayName = 'Card'
