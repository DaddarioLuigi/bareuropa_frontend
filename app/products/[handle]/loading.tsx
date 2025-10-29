export default function Loading() {
  return (
    <div className="min-h-screen bg-background">
      <div className="pt-16">
        {/* Breadcrumb Skeleton */}
        <div className="bg-muted/30 py-4">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="h-4 bg-muted animate-pulse rounded w-48" />
          </div>
        </div>

        {/* Product Details Skeleton */}
        <section className="py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="h-6 bg-muted animate-pulse rounded w-32 mb-8" />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              {/* Product Images Skeleton */}
              <div className="space-y-4">
                <div className="aspect-square bg-muted animate-pulse rounded-lg" />
                <div className="flex gap-4">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="w-20 h-20 bg-muted animate-pulse rounded-lg" />
                  ))}
                </div>
              </div>

              {/* Product Info Skeleton */}
              <div className="space-y-6">
                <div className="h-4 bg-muted animate-pulse rounded w-16 mb-2" />
                <div className="h-8 bg-muted animate-pulse rounded w-3/4 mb-4" />
                <div className="h-6 bg-muted animate-pulse rounded w-1/4 mb-6" />
                <div className="h-4 bg-muted animate-pulse rounded w-full mb-2" />
                <div className="h-4 bg-muted animate-pulse rounded w-2/3 mb-6" />
                
                <div className="flex gap-4">
                  <div className="h-12 bg-muted animate-pulse rounded flex-1" />
                  <div className="h-12 bg-muted animate-pulse rounded w-12" />
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}


