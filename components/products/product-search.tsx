'use client'

import { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Loader2 } from 'lucide-react'
import { API_BASE_URL } from '@/lib/config'
import { SearchBar } from '@/components/products/search-bar'

interface SearchResult {
  product_id: number
  base_name: string
  base_unit: string | null
  nobb_code: string | null
  ean_code: string | null
  images: Array<{ image_id: number; image_url: string }>
  retailer_count: number
  updated: string
}

interface SearchResponse {
  items: SearchResult[]
  total: number
  limit: number
  offset: number
  has_more: boolean
}

export default function ProductSearch({
  onSelect,
}: {
  onSelect: (code: string) => void
}) {
  const [searchTerm, setSearchTerm] = useState('')
  const [offset, setOffset] = useState(0)
  const limit = 10

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ['product-search', searchTerm, offset],
    queryFn: async () => {
      if (!searchTerm || searchTerm.length < 2) return null
      const params = new URLSearchParams({
        q: searchTerm,
        limit: limit.toString(),
        offset: offset.toString(),
      })
      const response = await fetch(
        `${API_BASE_URL}/api/products/search?${params}`
      )
      if (!response.ok) throw new Error('Search failed')
      return response.json() as Promise<SearchResponse>
    },
    enabled: searchTerm.length >= 2,
  })

  // Reset offset when search term changes
  useEffect(() => {
    setOffset(0)
  }, [searchTerm])

  return (
    <div className="space-y-4">
      <SearchBar
        onSearch={setSearchTerm}
        placeholder="Search by product name, NOBB, or EAN code..."
      />

      {isLoading ? (
        <div className="flex justify-center p-8">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : data?.items.length ? (
        <div className="space-y-4">
          <div className="text-sm text-muted-foreground">
            Found {data.total} results
          </div>
          <div className="grid gap-4">
            {data.items.map((item) => (
              <Card
                key={item.product_id}
                className="hover:bg-accent cursor-pointer transition-colors"
                onClick={() => item.nobb_code && onSelect(item.nobb_code)}
              >
                <CardContent className="p-4">
                  <div className="flex gap-4">
                    {item.images[0] && (
                      <img
                        src={item.images[0].image_url}
                        alt={item.base_name}
                        className="w-20 h-20 object-cover rounded"
                      />
                    )}
                    <div className="flex-1">
                      <h3 className="font-medium">{item.base_name}</h3>
                      <p className="text-sm text-muted-foreground">
                        Available at {item.retailer_count} retailers
                      </p>
                      <div className="mt-1 text-sm text-muted-foreground">
                        <p>Unit: {item.base_unit || 'N/A'}</p>
                        <p>NOBB: {item.nobb_code || 'N/A'} {item.ean_code ? `/ EAN: ${item.ean_code}` : ''}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          {data.has_more && (
            <div className="flex justify-center pt-4">
              <Button
                variant="outline"
                onClick={() => setOffset((prev) => prev + limit)}
                disabled={isFetching}
              >
                {isFetching ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Loading...
                  </>
                ) : (
                  'Load More'
                )}
              </Button>
            </div>
          )}
        </div>
      ) : searchTerm.length >= 2 ? (
        <div className="text-center py-8 text-muted-foreground">
          No results found
        </div>
      ) : null}
    </div>
  )
}
