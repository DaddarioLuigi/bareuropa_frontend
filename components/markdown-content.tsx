'use client'

import ReactMarkdown from 'react-markdown'
import { cn } from '@/lib/utils'

interface MarkdownContentProps {
  content?: string | null
  className?: string
  fallback?: string
}

export function MarkdownContent({ 
  content, 
  className,
  fallback = "Descrizione non disponibile." 
}: MarkdownContentProps) {
  if (!content) {
    return <p className={cn("text-muted-foreground", className)}>{fallback}</p>
  }

  return (
    <div className={cn("max-w-none", className)}>
      <ReactMarkdown
        components={{
          p: ({ children }) => <p className="text-muted-foreground leading-relaxed mb-4 last:mb-0">{children}</p>,
          h1: ({ children }) => <h1 className="text-2xl font-bold text-primary mb-4">{children}</h1>,
          h2: ({ children }) => <h2 className="text-xl font-semibold text-primary mb-3">{children}</h2>,
          h3: ({ children }) => <h3 className="text-lg font-semibold text-primary mb-2">{children}</h3>,
          ul: ({ children }) => <ul className="list-disc list-inside mb-4 space-y-1 text-muted-foreground">{children}</ul>,
          ol: ({ children }) => <ol className="list-decimal list-inside mb-4 space-y-1 text-muted-foreground">{children}</ol>,
          li: ({ children }) => <li className="text-muted-foreground">{children}</li>,
          strong: ({ children }) => <strong className="font-semibold text-foreground">{children}</strong>,
          em: ({ children }) => <em className="italic">{children}</em>,
          code: ({ children }) => (
            <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">{children}</code>
          ),
          blockquote: ({ children }) => (
            <blockquote className="border-l-4 border-primary/30 pl-4 italic text-muted-foreground my-4">
              {children}
            </blockquote>
          ),
          a: ({ href, children }) => (
            <a 
              href={href} 
              className="text-accent hover:text-accent/80 underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              {children}
            </a>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
}

