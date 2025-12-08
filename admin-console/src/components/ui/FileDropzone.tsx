import { useCallback, useState } from 'react'
import { CloudArrowUpIcon, XMarkIcon } from '@heroicons/react/24/outline'
import clsx from 'clsx'

interface FileDropzoneProps {
  onFilesSelected: (files: File[]) => void
  accept?: string
  maxSize?: number // in bytes
  multiple?: boolean
  label?: string
}

export function FileDropzone({
  onFilesSelected,
  accept = 'image/*',
  maxSize = 10 * 1024 * 1024,
  multiple = false,
  label = 'Drop files here or click to browse',
}: FileDropzoneProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [preview, setPreview] = useState<string | null>(null)

  const validateFiles = (files: FileList) => {
    const fileArray = Array.from(files)
    
    for (const file of fileArray) {
      if (file.size > maxSize) {
        setError(`File ${file.name} exceeds ${maxSize / 1024 / 1024}MB limit`)
        return false
      }
    }
    
    setError(null)
    return true
  }

  const handleFiles = useCallback(
    (files: FileList) => {
      if (!validateFiles(files)) return
      
      const fileArray = Array.from(files)
      onFilesSelected(fileArray)
      
      // Show preview for images
      if (fileArray[0] && fileArray[0].type.startsWith('image/')) {
        const reader = new FileReader()
        reader.onload = (e) => setPreview(e.target?.result as string)
        reader.readAsDataURL(fileArray[0])
      }
    },
    [onFilesSelected, maxSize]
  )

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragging(false)
      handleFiles(e.dataTransfer.files)
    },
    [handleFiles]
  )

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback(() => {
    setIsDragging(false)
  }, [])

  return (
    <div className="space-y-2">
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={clsx(
          'border-2 border-dashed rounded-lg p-8 text-center transition cursor-pointer',
          isDragging ? 'border-brand-accent bg-brand-accent/10' : 'border-gray-700 hover:border-brand-accent',
          error && 'border-discord-red'
        )}
      >
        <input
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={(e) => e.target.files && handleFiles(e.target.files)}
          className="hidden"
          id="file-upload"
        />
        <label htmlFor="file-upload" className="cursor-pointer">
          <CloudArrowUpIcon className="w-12 h-12 mx-auto text-gray-400 mb-4" />
          <p className="text-sm text-gray-400">{label}</p>
          <p className="text-xs text-gray-500 mt-2">Max {maxSize / 1024 / 1024}MB</p>
        </label>
      </div>
      
      {error && <p className="text-sm text-discord-red">{error}</p>}
      
      {preview && (
        <div className="relative">
          <img src={preview} alt="Preview" className="w-full h-48 object-cover rounded-lg" />
          <button
            onClick={() => setPreview(null)}
            className="absolute top-2 right-2 p-1 bg-background-secondary rounded-full hover:bg-background-tertiary"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>
      )}
    </div>
  )
}
