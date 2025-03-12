'use client'

import { useState } from 'react'
import ProductSearch from '@/components/products/product-search'
import { PriceComparison } from '@/components/products/price-comparison'
import {
  getProductPrices,
  getLatestProducts,
  getBasicStats,
} from '@/lib/api/products'
import { useQuery } from '@tanstack/react-query'
import { Loader2, Package2, ChevronDown } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { format } from 'date-fns'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { Button } from "@/components/ui/button"

export default function ProductsPage() {
  const [selectedNobbCode, setSelectedNobbCode] = useState<string | null>(null)

  const { data: stats, isLoading: isLoadingStats } = useQuery({
    queryKey: ['basic-stats'],
    queryFn: getBasicStats,
  })

  const {
    data: latestProducts,
    isLoading: isLoadingProducts,
    error: productsError,
  } = useQuery({
    queryKey: ['latest-products'],
    queryFn: () => getLatestProducts(0, 20),
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

  const content = (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      {/* Left Column - Search & Products */}
      <div className="space-y-8">
        <h1 className="text-2xl font-bold mb-8">Product Price Comparison</h1>
        <Tabs defaultValue="search" className="w-full">
          <TabsList>
            <TabsTrigger value="search">Search Products</TabsTrigger>
            <TabsTrigger value="latest">Latest Updates</TabsTrigger>
          </TabsList>
          <TabsContent value="search" className="mt-6">
            <ProductSearch onSelect={setSelectedNobbCode} />
          </TabsContent>
          <TabsContent value="latest" className="mt-6">
            {isLoadingProducts ? (
              <div className="flex items-center justify-center p-8">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            ) : productsError ? (
              <div className="text-destructive p-4">
                Failed to load products. Please try again.
              </div>
            ) : (
              <ScrollArea className="h-[800px] rounded-md border">
                <div className="p-4">
                  <div className="grid gap-4">
                    {latestProducts?.data.map((product) => (
                      <Card
                        key={product.nobb_code}
                        className="hover:bg-accent cursor-pointer"
                        onClick={() => setSelectedNobbCode(product.nobb_code)}
                      >
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                          <CardTitle className="text-sm font-medium">
                            {product.base_name}
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="p-4">
                          <div className="flex gap-4">
                            {product.images[0] && (
                              <img
                                src={product.images[0].image_url}
                                alt={product.base_name}
                                className="w-20 h-20 object-cover rounded"
                              />
                            )}
                            <div className="flex-1">
                              <p className="text-sm text-muted-foreground">
                                Updated: {format(new Date(product.updated), 'PPp')}
                              </p>
                              <div className="mt-1 text-sm text-muted-foreground">
                                <p>Unit: {product.base_unit || 'N/A'}</p>
                                <p>NOBB: {product.nobb_code || 'N/A'} {product.ean_code ? `/ EAN: ${product.ean_code}` : ''}</p>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              </ScrollArea>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Right Column - Product Info & Price Comparison */}
      <div className="space-y-8">
        {/* Product Info Card */}
        <Collapsible>
          <div>
            <div className="pb-0">
              <CollapsibleTrigger asChild>
                <Button variant="ghost" className="w-full flex justify-between items-center px-0">
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-semibold">Total Products</span>
                    {!isLoadingStats && (
                      <span className="text-muted-foreground">
                        ({stats?.total_products.toLocaleString()})
                      </span>
                    )}
                  </div>
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </CollapsibleTrigger>
            </div>
            <CollapsibleContent>
              <div className="pt-4">
                {isLoadingStats ? (
                  <div className="flex items-center justify-center p-4">
                    <Loader2 className="h-5 w-5 animate-spin" />
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <Package2 className="h-5 w-5 text-muted-foreground" />
                      <span className="text-muted-foreground">
                        Total Products:
                      </span>
                      <span className="font-bold">
                        {stats?.total_products.toLocaleString()}
                      </span>
                    </div>
                    <div className="space-y-2">
                      <div className="font-medium text-muted-foreground">
                        Products per retailer:
                      </div>
                      <div className="grid gap-2">
                        {stats?.retailer_product_counts.map((retailer) => (
                          <div
                            key={retailer.retailer_id}
                            className="flex justify-between items-center text-sm border-b last:border-0 pb-2 last:pb-0"
                          >
                            <span className="font-medium">
                              {retailer.retailer_name}
                            </span>
                            <span className="text-muted-foreground">
                              {retailer.total_products.toLocaleString()} products
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </CollapsibleContent>
          </div>
        </Collapsible>

        {/* Price Comparison */}
        <div>
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

  return content
}
