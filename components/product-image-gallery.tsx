"use client"

import { useEffect, useState } from "react"

type GalleryImage = { id?: string; url: string }

interface ProductImageGalleryProps {
  main: string
  images: GalleryImage[]
  alt: string
}

export function ProductImageGallery({ main, images, alt }: ProductImageGalleryProps) {
  const [selectedUrl, setSelectedUrl] = useState<string>(main)

  useEffect(() => {
    setSelectedUrl(main)
  }, [main])

  const thumbnails = images && images.length > 0 ? images : [{ url: main }]

  return (
    <div className="space-y-4">
      <div className="aspect-square overflow-hidden rounded-lg bg-muted">
        <img src={selectedUrl} alt={alt} className="w-full h-full object-cover" />
      </div>

      {thumbnails.length > 1 && (
        <div className="flex gap-4">
          {thumbnails.slice(0, 4).map((image, index) => {
            const isActive = selectedUrl === image.url
            return (
              <button
                key={image.id || index}
                type="button"
                onClick={() => setSelectedUrl(image.url)}
                className={`aspect-square w-20 overflow-hidden rounded-lg border-2 ${
                  isActive ? 'border-primary' : 'border-transparent hover:border-primary/50'
                }`}
                aria-label={`Mostra immagine ${index + 1}`}
              >
                <img src={image.url} alt={`${alt} ${index + 1}`} className="w-full h-full object-cover" />
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}


