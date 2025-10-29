"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Heart } from "lucide-react"

interface LikeButtonProps {
  productId: string
  className?: string
}

export function LikeButton({ productId, className }: LikeButtonProps) {
  const [liked, setLiked] = useState<boolean>(false)

  useEffect(() => {
    try {
      const raw = localStorage.getItem("likedProducts")
      const likedIds: string[] = raw ? JSON.parse(raw) : []
      setLiked(likedIds.includes(productId))
    } catch {
      // ignore localStorage errors
    }
  }, [productId])

  const toggleLike = () => {
    try {
      const raw = localStorage.getItem("likedProducts")
      const likedIds: string[] = raw ? JSON.parse(raw) : []
      let next: string[]
      if (likedIds.includes(productId)) {
        next = likedIds.filter((id) => id !== productId)
        setLiked(false)
      } else {
        next = [...likedIds, productId]
        setLiked(true)
      }
      localStorage.setItem("likedProducts", JSON.stringify(next))
    } catch {
      // ignore localStorage errors
    }
  }

  return (
    <Button
      type="button"
      variant="outline"
      size="icon"
      aria-pressed={liked}
      aria-label={liked ? "Togli mi piace" : "Metti mi piace"}
      onClick={toggleLike}
      className={className}
   >
      <Heart className={liked ? "fill-red-500 text-red-500" : ""} />
    </Button>
  )
}


