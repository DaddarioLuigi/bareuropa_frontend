import { Card, CardContent, CardHeader } from "@/components/ui/card"

export default function Loading() {
  return (
    <div className="min-h-screen bg-background">
      <div className="pt-16">
        {/* Hero Section Skeleton */}
        <section className="bg-gradient-to-r from-primary/10 to-accent/10 py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="h-12 bg-muted animate-pulse rounded w-64 mx-auto mb-4" />
            <div className="h-6 bg-muted animate-pulse rounded w-96 mx-auto" />
          </div>
        </section>

        {/* Products Grid Skeleton */}
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {Array.from({ length: 8 }).map((_, i) => (
                <Card key={i} className="h-full">
                  <CardHeader className="p-0">
                    <div className="w-full h-64 bg-muted animate-pulse rounded-t-lg" />
                  </CardHeader>
                  <CardContent className="p-4">
                    <div className="h-4 bg-muted animate-pulse rounded mb-2" />
                    <div className="h-3 bg-muted animate-pulse rounded mb-4 w-3/4" />
                    <div className="h-6 bg-muted animate-pulse rounded w-1/2" />
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}


