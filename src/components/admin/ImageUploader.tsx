'use client'

import { useRef, useState } from 'react'
import Image from 'next/image'

interface ImageUploaderProps {
  images: string[]
  onImagesChange: (images: string[]) => void
}

export function ImageUploader({ images, onImagesChange }: ImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [dragIndex, setDragIndex] = useState<number | null>(null)

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files?.length) return

    setUploading(true)
    const formData = new FormData()
    formData.append('file', files[0])

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })
      const data = await res.json()
      if (data.url) {
        onImagesChange([...images, data.url])
      }
    } catch {
      alert('Erreur lors du téléchargement')
    } finally {
      setUploading(false)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  const removeImage = (index: number) => {
    onImagesChange(images.filter((_, i) => i !== index))
  }

  const moveImage = (from: number, to: number) => {
    const updated = [...images]
    const [moved] = updated.splice(from, 1)
    updated.splice(to, 0, moved)
    onImagesChange(updated)
  }

  return (
    <div>
      <p className="text-xs text-[var(--text-muted)] mb-3">
        Glissez pour réordonner. La première image sera l{"'"}image principale.
      </p>
      <div className="grid grid-cols-3 gap-3 mb-4">
        {images.map((url, i) => (
          <div
            key={i}
            draggable
            onDragStart={() => setDragIndex(i)}
            onDragOver={(e) => { e.preventDefault(); setDragIndex(i) }}
            onDragEnd={() => {
              if (dragIndex !== null && dragIndex !== i) {
                moveImage(dragIndex, i)
              }
              setDragIndex(null)
            }}
            className={`relative aspect-square rounded-lg overflow-hidden bg-[var(--bg-primary)] group cursor-grab active:cursor-grabbing transition-opacity ${
              dragIndex === i ? 'opacity-50 ring-2 ring-[var(--gold)]' : ''
            }`}
          >
            <Image src={url} alt="" fill className="object-cover" sizes="150px" />
            <div className="absolute inset-x-0 top-0 h-8 bg-gradient-to-b from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                <path d="M8 6l4-4 4 4M8 18l4 4 4-4M6 8l-4 4 4 4M18 8l4 4-4 4"/>
              </svg>
            </div>
            {i === 0 && (
              <span className="absolute bottom-1 left-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-[var(--gold)] text-[var(--bg-primary)]">
                Principale
              </span>
            )}
            <button
              type="button"
              onClick={() => removeImage(i)}
              className="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-xs"
            >
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M18 6L6 18M6 6l12 12"/></svg>
            </button>
          </div>
        ))}
        {images.length < 6 && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className="aspect-square rounded-lg border-2 border-dashed border-[var(--border)] flex items-center justify-center text-[var(--text-muted)] hover:border-[var(--gold)] hover:text-[var(--gold)] transition-all"
          >
            {uploading ? (
              <span className="text-xs animate-pulse">Upload...</span>
            ) : (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12" />
              </svg>
            )}
          </button>
        )}
      </div>
      <input ref={inputRef} type="file" accept="image/*" onChange={handleUpload} className="hidden" />
    </div>
  )
}
