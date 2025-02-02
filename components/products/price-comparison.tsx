'use client'

import { ProductPriceStats } from '@/lib/types'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import { ArrowDownIcon, ArrowUpIcon, Store } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useState } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { ImageGallery } from '@/components/ui/image-gallery'

interface PriceComparisonProps {
  data: ProductPriceStats
}

export function PriceComparison({ data }: PriceComparisonProps) {
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')
  const [showGallery, setShowGallery] = useState(false)
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)

  const sortedRetailers = [...(data.retailer_stats || [])].sort((a, b) => {
    return sortOrder === 'asc'
      ? a.average_price - b.average_price
      : b.average_price - a.average_price
  })

  const handleImageClick = (index: number) => {
    setSelectedImageIndex(index)
    setShowGallery(true)
  }

  // Helper function to format prices
  const formatPrice = (price: number | null | undefined, includeCurrency: boolean = true): string => {
    if (typeof price !== 'number') return 'N/A'
    return `${price.toFixed(2)}${includeCurrency ? ' NOK' : ''}`
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex gap-6">
            {data.product.images?.[0] && (
              <img
                src={data.product.images[0].image_url}
                alt={data.product.base_name}
                className="w-32 h-32 object-cover rounded-lg cursor-pointer hover:opacity-80 transition-opacity"
                onClick={() => handleImageClick(0)}
              />
            )}
            <div>
              <CardTitle>{data.product.base_name}</CardTitle>
              <CardDescription>
                NOBB: {data.product.nobb_code}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm font-medium">Median Price</p>
              <p className="text-2xl font-bold">
                {formatPrice(data.median_price_all_retailers)} / {data.product.base_unit}
              </p>
            </div>
            <Button
              variant="outline"
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            >
              Sort {sortOrder === 'asc' ? <ArrowUpIcon /> : <ArrowDownIcon />}
            </Button>
          </div>
        </CardContent>
      </Card>

      {showGallery && data.product.images && (
        <ImageGallery
          images={data.product.images}
          initialIndex={selectedImageIndex}
          onClose={() => setShowGallery(false)}
        />
      )}

      <Card>
        <CardContent className="pt-6">
          {sortedRetailers.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Retailer</TableHead>
                  <TableHead>Average Price</TableHead>
                  <TableHead>Price Range</TableHead>
                  <TableHead>Stores</TableHead>
                  <TableHead>Store Link</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedRetailers.map((retailer) => {
                  const retailerProduct = data.retailer_products?.find(
                    (rp) => rp.retailer_id === retailer.retailer_id
                  );
                  return (
                    <TableRow key={retailer.retailer_id}>
                      <TableCell className="font-medium">
                        {retailer.retailer_name}
                      </TableCell>
                      <TableCell>{formatPrice(retailer.average_price)}</TableCell>
                      <TableCell>
                        {formatPrice(retailer.min_price, false)} - {formatPrice(retailer.max_price)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Store className="h-4 w-4" />
                          {retailer.store_count}
                        </div>
                      </TableCell>
                      <TableCell>
                        {retailerProduct?.url_product ? (
                          <a
                            href={retailerProduct.url_product}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800 underline"
                          >
                            View Product
                          </a>
                        ) : (
                          'No link available'
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-4 text-muted-foreground">
              No retailer data available
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
