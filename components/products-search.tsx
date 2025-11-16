'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Search, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useEffect, useState, useCallback } from 'react'
import { useDebounce } from '@/hooks/use-debounce'

export function ProductsSearch() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '')
  const debouncedSearch = useDebounce(searchQuery, 500)

  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString())
    
    if (debouncedSearch.trim()) {
      params.set('q', debouncedSearch.trim())
      params.delete('page') // Reset alla prima pagina quando si cerca
    } else {
      params.delete('q')
    }
    
    const newUrl = params.toString() ? `/products?${params.toString()}` : '/products'
    router.push(newUrl)
  }, [debouncedSearch, router, searchParams])

  const handleClear = useCallback(() => {
    setSearchQuery('')
    const params = new URLSearchParams(searchParams.toString())
    params.delete('q')
    params.delete('page')
    const newUrl = params.toString() ? `/products?${params.toString()}` : '/products'
    router.push(newUrl)
  }, [router, searchParams])

  return (
    <div className="relative w-full max-w-md mx-auto">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Cerca prodotti..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 pr-10"
          aria-label="Cerca prodotti"
        />
        {searchQuery && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleClear}
            className="absolute right-1 top-1/2 transform -translate-y-1/2 h-7 w-7 p-0"
            aria-label="Cancella ricerca"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  )
}



