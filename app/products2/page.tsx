'use client'

import { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Loader2 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { getLatestProducts, getBasicStats, getProductPrices } from '@/lib/api/products'
import { Product, columns } from './columns'
import { DataTable } from './data-table'
import { LatestProduct } from '@/lib/types'

// Helper function to format prices
const formatPrice = (price: number | null | undefined): string => {
  if (typeof price !== 'number') return 'N/A'
  return new Intl.NumberFormat('nb-NO', {
    style: 'currency',
    currency: 'NOK',
  }).format(price)
}

export default function Products2Page() {
  const [productsWithPrices, setProductsWithPrices] = useState<Product[]>([])
  const [isLoadingPrices, setIsLoadingPrices] = useState(false)

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
    queryFn: () => getLatestProducts(0, 20), // Fetch 20 products for the table
  })

  // Fetch price data for each product
  useEffect(() => {
    async function fetchPriceData() {
      if (!latestProducts?.data || latestProducts.data.length === 0) return

      setIsLoadingPrices(true)
      
      try {
        // Create an array to store products with price data
        const productsData: Product[] = []
        
        // Process products in batches to avoid too many simultaneous requests
        const batchSize = 5
        for (let i = 0; i < latestProducts.data.length; i += batchSize) {
          const batch = latestProducts.data.slice(i, i + batchSize)
          
          // Fetch price data for each product in the batch
          const batchPromises = batch.map(async (product: LatestProduct) => {
            try {
              const priceData = await getProductPrices(product.nobb_code)
              
              return {
                id: product.nobb_code,
                nobb_code: product.nobb_code,
                base_name: product.base_name,
                base_unit: product.base_unit,
                ean_code: product.ean_code,
                images: product.images,
                updated: product.updated,
                median_price_all_retailers: priceData.data.median_price_all_retailers
              }
            } catch (error) {
              // If we can't get price data, still include the product but without price
              return {
                id: product.nobb_code,
                nobb_code: product.nobb_code,
                base_name: product.base_name,
                base_unit: product.base_unit,
                ean_code: product.ean_code,
                images: product.images,
                updated: product.updated,
                median_price_all_retailers: undefined
              }
            }
          })
          
          // Wait for all products in the batch to be processed
          const batchResults = await Promise.all(batchPromises)
          productsData.push(...batchResults)
        }
        
        setProductsWithPrices(productsData)
      } catch (error) {
        console.error("Error fetching price data:", error)
      } finally {
        setIsLoadingPrices(false)
      }
    }

    if (latestProducts?.data) {
      fetchPriceData()
    }
  }, [latestProducts])

  const isLoading = isLoadingProducts || isLoadingPrices

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Products Table</h1>
        {!isLoadingStats && (
          <div className="text-muted-foreground">
            Total Products: {stats?.total_products.toLocaleString()}
          </div>
        )}
      </div>

      <Card className="mb-6">
        <CardHeader className="pb-2">
          <CardTitle className="text-md">Product Information</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            This table displays product information with columns for product name, NOBB code, unit, and median price.
            You can search for products by name and sort each column.
          </p>
        </CardContent>
      </Card>

      {isLoading ? (
        <div className="flex items-center justify-center p-12">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : productsError ? (
        <div className="bg-destructive/10 text-destructive p-4 rounded-md">
          Failed to load products. Please try again.
        </div>
      ) : (
        <DataTable columns={columns} data={productsWithPrices} />
      )}
    </div>
  )
}
