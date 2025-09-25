import React from "react"
import Image from "next/image"

interface EuropaLogoProps {
  className?: string
  size?: "sm" | "md" | "lg"
}

export function EuropaLogo({ className = "", size = "md" }: EuropaLogoProps) {
  const sizeClasses = {
    sm: "h-8 w-auto",
    md: "h-12 w-auto", 
    lg: "h-16 w-auto"
  }

  return (
    <div className={`flex items-center ${className}`}>
      <Image
        src="/logo_bareuropa.png"
        alt="Bar Europa Logo"
        width={size === "sm" ? 32 : size === "md" ? 48 : 64}
        height={size === "sm" ? 32 : size === "md" ? 48 : 64}
        className={`${sizeClasses[size]} object-contain`}
        priority
      />
    </div>
  )
}
