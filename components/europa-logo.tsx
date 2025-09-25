import React from "react"

interface EuropaLogoProps {
  className?: string
  size?: "sm" | "md" | "lg"
}

export function EuropaLogo({ className = "", size = "md" }: EuropaLogoProps) {
  const sizeClasses = {
    sm: "h-6",
    md: "h-10", 
    lg: "h-14"
  }

  const textSizes = {
    sm: { main: "text-sm", sub: "text-xs" },
    md: { main: "text-lg", sub: "text-xs" },
    lg: { main: "text-xl", sub: "text-sm" }
  }

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      {/* Simplified logo - just text for better mobile readability */}
      <div className="flex flex-col">
        <div className={`font-display font-bold text-primary ${textSizes[size].main} tracking-wide leading-tight`}>
          Bar Europa
        </div>
        <div className={`text-muted-foreground ${textSizes[size].sub} -mt-0.5`}>
          dal 1966
        </div>
      </div>
    </div>
  )
}
