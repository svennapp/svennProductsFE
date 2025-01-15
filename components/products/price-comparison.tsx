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
  const formatPrice = (price: number | null | undefined): string => {
    if (typeof price !== 'number') return 'N/A'
    return `${price.toFixed(2)} NOK`
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
                Price comparison across retailers
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm font-medium">Median Price</p>
              <p className="text-2xl font-bold">
                {formatPrice(data.median_price_all_retailers)}
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
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedRetailers.map((retailer) => (
                  <TableRow key={retailer.retailer_id}>
                    <TableCell className="font-medium">
                      {retailer.retailer_name}
                    </TableCell>
                    <TableCell>{formatPrice(retailer.average_price)}</TableCell>
                    <TableCell>
                      {formatPrice(retailer.min_price)} -{' '}
                      {formatPrice(retailer.max_price)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Store className="h-4 w-4" />
                        {retailer.store_count}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
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
