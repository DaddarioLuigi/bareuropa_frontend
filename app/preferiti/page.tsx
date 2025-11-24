"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { MarkdownContent } from "@/components/markdown-content"

interface Product {
  id: string
  title: string
  description?: string
  handle: string
  thumbnail?: string
  images?: Array<{ id: string; url: string }>
}

export default function PreferitiPage() {
  const [likedIds, setLikedIds] = useState<string[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState<boolean>(true)

  useEffect(() => {
    try {
      const raw = localStorage.getItem("likedProducts")
      const ids = raw ? (JSON.parse(raw) as string[]) : []
      setLikedIds(ids)
    } catch {
      setLikedIds([])
    }
  }, [])

  useEffect(() => {
    const fetchProducts = async () => {
      if (likedIds.length === 0) {
        setProducts([])
        setLoading(false)
        return
      }
      try {
        const results = await Promise.all(
          likedIds.map(async (id) => {
            const res = await fetch(`/api/medusa/store/products/${id}`)
            const data = await res.json()
            return data.product as Product
          })
        )
        setProducts(results.filter(Boolean))
      } catch {
        setProducts([])
      } finally {
        setLoading(false)
      }
    }
    fetchProducts()
  }, [likedIds])

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="pt-16">
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="font-display text-4xl md:text-5xl font-bold text-primary mb-6">Preferiti</h1>
            {loading ? (
              <p className="text-muted-foreground">Caricamento…</p>
            ) : likedIds.length === 0 ? (
              <div className="text-center py-16">
                <h2 className="text-xl font-semibold mb-2">Non hai ancora messo mi piace a nessun prodotto</h2>
                <p className="text-muted-foreground mb-6">Scopri i nostri prodotti e aggiungili ai preferiti.</p>
                <Link href="/products">
                  <Button variant="outline">Vai ai Prodotti</Button>
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                {products.map((product) => {
                  const image = product.thumbnail || product.images?.[0]?.url || "/placeholder.svg"
                  return (
                    <Card key={product.id} className="group hover:shadow-lg transition-all duration-300 h-full">
                      <CardHeader className="p-0">
                        <div className="relative overflow-hidden rounded-t-lg">
                          <img
                            src={image}
                            alt={product.title}
                            className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        </div>
                      </CardHeader>
                      <CardContent className="p-4 flex-1">
                        <CardTitle className="text-lg mb-2 line-clamp-1">{product.title}</CardTitle>
                        <div className="mb-4 line-clamp-2">
                          <MarkdownContent 
                            content={product.description} 
                            className="text-sm"
                            fallback=""
                          />
                        </div>
                      </CardContent>
                      <CardFooter className="p-4 pt-0 flex gap-2">
                        <Link href={`/products/${product.handle}`} className="flex-1">
                          <Button variant="outline" className="w-full bg-transparent">Dettagli</Button>
                        </Link>
                      </CardFooter>
                    </Card>
                  )
                })}
              </div>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}


