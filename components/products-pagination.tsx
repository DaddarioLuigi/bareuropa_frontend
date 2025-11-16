'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useMemo } from 'react'

interface ProductsPaginationProps {
  currentPage: number
  totalPages: number
  totalProducts: number
  limit: number
}

export function ProductsPagination({
  currentPage,
  totalPages,
  totalProducts,
  limit,
}: ProductsPaginationProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const startItem = useMemo(() => {
    return currentPage * limit + 1
  }, [currentPage, limit])

  const endItem = useMemo(() => {
    return Math.min((currentPage + 1) * limit, totalProducts)
  }, [currentPage, limit, totalProducts])

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString())
    if (newPage === 0) {
      params.delete('page')
    } else {
      params.set('page', newPage.toString())
    }
    const newUrl = params.toString() ? `/products?${params.toString()}` : '/products'
    router.push(newUrl)
    
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const getPageNumbers = () => {
    const pages: (number | string)[] = []
    const maxVisible = 5

    if (totalPages <= maxVisible) {
      // Mostra tutte le pagine se sono poche
      for (let i = 0; i < totalPages; i++) {
        pages.push(i)
      }
    } else {
      // Logica per mostrare pagine con ellipsis
      if (currentPage < 3) {
        // Inizio: mostra prime pagine
        for (let i = 0; i < 4; i++) {
          pages.push(i)
        }
        pages.push('ellipsis')
        pages.push(totalPages - 1)
      } else if (currentPage > totalPages - 4) {
        // Fine: mostra ultime pagine
        pages.push(0)
        pages.push('ellipsis')
        for (let i = totalPages - 4; i < totalPages; i++) {
          pages.push(i)
        }
      } else {
        // Centro: mostra pagina corrente e vicine
        pages.push(0)
        pages.push('ellipsis')
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i)
        }
        pages.push('ellipsis')
        pages.push(totalPages - 1)
      }
    }

    return pages
  }

  if (totalPages <= 1) {
    return null
  }

  return (
    <div className="flex flex-col items-center gap-4 mt-8">
      <div className="text-sm text-muted-foreground">
        Mostrando {startItem}-{endItem} di {totalProducts} prodotti
      </div>
      
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 0}
          aria-label="Pagina precedente"
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Precedente
        </Button>

        <div className="flex items-center gap-1">
          {getPageNumbers().map((page, index) => {
            if (page === 'ellipsis') {
              return (
                <span key={`ellipsis-${index}`} className="px-2 text-muted-foreground">
                  ...
                </span>
              )
            }

            const pageNum = page as number
            const isCurrentPage = pageNum === currentPage

            return (
              <Button
                key={pageNum}
                variant={isCurrentPage ? 'default' : 'outline'}
                size="sm"
                onClick={() => handlePageChange(pageNum)}
                className={isCurrentPage ? 'min-w-[44px]' : 'min-w-[44px]'}
                aria-label={`Vai alla pagina ${pageNum + 1}`}
                aria-current={isCurrentPage ? 'page' : undefined}
              >
                {pageNum + 1}
              </Button>
            )
          })}
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage >= totalPages - 1}
          aria-label="Pagina successiva"
        >
          Successiva
          <ChevronRight className="h-4 w-4 ml-1" />
        </Button>
      </div>
    </div>
  )
}



