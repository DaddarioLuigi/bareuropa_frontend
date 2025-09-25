import React from "react"

interface EuropaLogoProps {
  className?: string
  size?: "sm" | "md" | "lg"
}

export function EuropaLogo({ className = "", size = "md" }: EuropaLogoProps) {
  const sizeClasses = {
    sm: "h-8",
    md: "h-12", 
    lg: "h-16"
  }

  const textSizes = {
    sm: { main: "text-lg", sub: "text-xs" },
    md: { main: "text-xl", sub: "text-sm" },
    lg: { main: "text-2xl", sub: "text-base" }
  }

  return (
    <div className={`flex flex-col items-center ${className}`}>
      {/* Decorative flourish */}
      <svg
        className={`${sizeClasses[size]} mb-1`}
        viewBox="0 0 24 8"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M2 4C2 4 4 2 6 4C8 6 10 2 12 4C14 6 16 2 18 4C20 6 22 4 22 4"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
      </svg>
      
      {/* Main Europa text */}
      <div className={`font-display font-bold text-primary ${textSizes[size].main} tracking-wide`}>
        Europa
      </div>
      
      {/* Subtitle */}
      <div className={`text-muted-foreground ${textSizes[size].sub} -mt-1`}>
        <div>Tradizione italiana</div>
        <div className="text-xs">dal 1966</div>
      </div>
    </div>
  )
}
