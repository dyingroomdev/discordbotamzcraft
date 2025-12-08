import { forwardRef, InputHTMLAttributes } from 'react'
import clsx from 'clsx'

interface FormInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  helperText?: string
}

export const FormInput = forwardRef<HTMLInputElement, FormInputProps>(
  ({ label, error, helperText, className, ...props }, ref) => {
    return (
      <div className="space-y-2">
        {label && <label className="block text-sm font-medium">{label}</label>}
        <input
          ref={ref}
          className={clsx(
            'w-full bg-background-tertiary border rounded-lg px-4 py-2 focus:outline-none transition',
            error ? 'border-discord-red focus:border-discord-red' : 'border-gray-700 focus:border-brand-accent',
            className
          )}
          {...props}
        />
        {error && <p className="text-sm text-discord-red">{error}</p>}
        {helperText && !error && <p className="text-xs text-gray-500">{helperText}</p>}
      </div>
    )
  }
)

FormInput.displayName = 'FormInput'

interface TextAreaProps extends InputHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
  rows?: number
}

export const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(
  ({ label, error, className, rows = 4, ...props }, ref) => {
    return (
      <div className="space-y-2">
        {label && <label className="block text-sm font-medium">{label}</label>}
        <textarea
          ref={ref}
          rows={rows}
          className={clsx(
            'w-full bg-background-tertiary border rounded-lg px-4 py-2 focus:outline-none transition resize-none',
            error ? 'border-discord-red focus:border-discord-red' : 'border-gray-700 focus:border-brand-accent',
            className
          )}
          {...props as any}
        />
        {error && <p className="text-sm text-discord-red">{error}</p>}
      </div>
    )
  }
)

TextArea.displayName = 'TextArea'
