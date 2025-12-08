import { useState } from 'react'
import { XMarkIcon } from '@heroicons/react/24/outline'

interface TagMultiSelectProps {
  options: { value: string; label: string }[]
  selected: string[]
  onChange: (selected: string[]) => void
  label?: string
  placeholder?: string
}

export function TagMultiSelect({ options, selected, onChange, label, placeholder = 'Select...' }: TagMultiSelectProps) {
  const [isOpen, setIsOpen] = useState(false)

  const handleToggle = (value: string) => {
    if (selected.includes(value)) {
      onChange(selected.filter((v) => v !== value))
    } else {
      onChange([...selected, value])
    }
  }

  const handleRemove = (value: string) => {
    onChange(selected.filter((v) => v !== value))
  }

  const selectedLabels = options.filter((opt) => selected.includes(opt.value))

  return (
    <div className="space-y-2">
      {label && <label className="block text-sm font-medium">{label}</label>}
      
      <div className="relative">
        <div
          onClick={() => setIsOpen(!isOpen)}
          className="w-full bg-background-tertiary border border-gray-700 rounded-lg px-4 py-2 cursor-pointer min-h-[42px] flex flex-wrap gap-2"
        >
          {selectedLabels.length === 0 ? (
            <span className="text-gray-500">{placeholder}</span>
          ) : (
            selectedLabels.map((opt) => (
              <span
                key={opt.value}
                className="inline-flex items-center gap-1 px-2 py-1 bg-brand-accent/20 text-brand-accent rounded text-sm"
              >
                {opt.label}
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    handleRemove(opt.value)
                  }}
                  className="hover:text-brand-accent-light"
                >
                  <XMarkIcon className="w-3 h-3" />
                </button>
              </span>
            ))
          )}
        </div>

        {isOpen && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
            <div className="absolute z-20 w-full mt-1 bg-background-secondary border border-gray-800 rounded-lg shadow-lg max-h-60 overflow-y-auto">
              {options.map((opt) => (
                <div
                  key={opt.value}
                  onClick={() => handleToggle(opt.value)}
                  className="px-4 py-2 hover:bg-background-tertiary cursor-pointer flex items-center gap-2"
                >
                  <input
                    type="checkbox"
                    checked={selected.includes(opt.value)}
                    onChange={() => {}}
                    className="w-4 h-4"
                  />
                  <span className="text-sm">{opt.label}</span>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
