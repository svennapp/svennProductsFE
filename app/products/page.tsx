'use client'

import { useState } from 'react'
import { SearchBar } from '@/components/products/search-bar'
import { ProductCard } from '@/components/products/product-card'
import { PriceComparison } from '@/components/products/price-comparison'
import {
  getProductPrices,
  getProductsByCategory,
  getBasicStats,
} from '@/lib/api/products'
import { useQuery } from '@tanstack/react-query'
import { Loader2, Package2, Store } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  type Product,
  type ProductPriceStats,
  type BasicStats,
} from '@/lib/types'

export default function ProductsPage() {
  const [selectedNobbCode, setSelectedNobbCode] = useState<string | null>(null)
  const [selectedCategory, setSelectedCategory] = useState('1') // Default category

  const { data: stats, isLoading: isLoadingStats } = useQuery<BasicStats>({
    queryKey: ['basic-stats'],
    queryFn: getBasicStats,
  })

  const {
    data: products,
    isLoading: isLoadingProducts,
    error: productsError,
  } = useQuery({
    queryKey: ['products', selectedCategory],
    queryFn: () => getProductsByCategory(selectedCategory),
  })

  const {
    data: priceStats,
    isLoading: isLoadingPrices,
    error: pricesError,
  } = useQuery({
    queryKey: ['prices', selectedNobbCode],
    queryFn: () => getProductPrices(selectedNobbCode!),
    enabled: !!selectedNobbCode,
  })

  const handleSearch = (query: string) => {
    setSelectedNobbCode(query)
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-4xl font-bold mb-8">Product Price Comparison</h1>

      {/* Stats Section */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center gap-2 text-muted-foreground mb-2">
            <Package2 className="h-5 w-5" />
            <h3 className="font-medium">Total Products</h3>
          </div>
          {isLoadingStats ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <p className="text-3xl font-bold">
              {stats?.total_products.toLocaleString()}
            </p>
          )}
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center gap-2 text-muted-foreground mb-2">
            <Store className="h-5 w-5" />
            <h3 className="font-medium">
              Retailers ({stats?.total_retailers})
            </h3>
          </div>
          {isLoadingStats ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <div className="space-y-2">
              {stats?.retailer_product_counts.map((retailer) => (
                <div
                  key={retailer.retailer_id}
                  className="flex justify-between items-center text-sm"
                >
                  <span className="font-medium">{retailer.retailer_name}</span>
                  <span className="text-muted-foreground">
                    {retailer.total_products.toLocaleString()} products
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="mb-8">
        <SearchBar onSearch={handleSearch} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <h2 className="text-2xl font-semibold mb-4">Products</h2>
          {isLoadingProducts ? (
            <div className="flex items-center justify-center p-8">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : productsError ? (
            <div className="text-destructive p-4">
              Failed to load products. Please try again.
            </div>
          ) : (
            <div className="grid gap-4">
              {products?.data?.map((product: Product) => (
                <ProductCard
                  key={product.product_id}
                  product={product}
                  onClick={() => setSelectedNobbCode(product.nobb_code)}
                />
              ))}
            </div>
          )}
        </div>

        <div>
          <h2 className="text-2xl font-semibold mb-4">Price Comparison</h2>
          {isLoadingPrices ? (
            <div className="flex items-center justify-center p-8">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : pricesError ? (
            <div className="text-destructive p-4">
              Failed to load price information. Please try again.
            </div>
          ) : priceStats?.data ? (
            <PriceComparison data={priceStats.data} />
          ) : (
            <div className="text-muted-foreground p-4">
              Select a product to view price comparison
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
