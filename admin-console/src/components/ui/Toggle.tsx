import { useState } from 'react'
import clsx from 'clsx'

interface ToggleProps {
  checked: boolean
  onChange: (checked: boolean) => void
  label?: string
  disabled?: boolean
  optimistic?: boolean
}

export function Toggle({ checked, onChange, label, disabled = false, optimistic = false }: ToggleProps) {
  const [localChecked, setLocalChecked] = useState(checked)
  const displayChecked = optimistic ? localChecked : checked

  const handleChange = () => {
    if (disabled) return
    
    if (optimistic) {
      setLocalChecked(!localChecked)
    }
    
    onChange(!checked)
  }

  return (
    <label className="flex items-center gap-3 cursor-pointer">
      <div
        className={clsx(
          'relative w-11 h-6 rounded-full transition-colors',
          displayChecked ? 'bg-brand-accent' : 'bg-gray-700',
          disabled && 'opacity-50 cursor-not-allowed'
        )}
        onClick={handleChange}
      >
        <div
          className={clsx(
            'absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform',
            displayChecked && 'transform translate-x-5'
          )}
        />
      </div>
      {label && <span className="text-sm">{label}</span>}
    </label>
  )
}
