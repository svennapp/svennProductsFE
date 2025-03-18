// lib/api/product-search.ts
import { API_BASE_URL } from '../config'
import { Product } from '@/app/products2/columns'

export type SortField = 'name' | 'price' | 'retailer_count'
export type SortOrder = 'asc' | 'desc'

export interface ProductSearchParams {
  q?: string
  limit?: number
  offset?: number
  sort_by?: SortField
  sort_order?: SortOrder
}

export interface ProductSearchResponse {
  items: Product[]
  total: number
  limit: number
  offset: number
  has_more: boolean
}

export async function searchProducts(params: ProductSearchParams): Promise<ProductSearchResponse> {
  const url = new URL(`${API_BASE_URL}/api/products/search`)
  
  // Add query parameters
  if (params.q !== undefined) url.searchParams.append('q', params.q)
  if (params.limit !== undefined) url.searchParams.append('limit', params.limit.toString())
  if (params.offset !== undefined) url.searchParams.append('offset', params.offset.toString())
  if (params.sort_by !== undefined) url.searchParams.append('sort_by', params.sort_by)
  if (params.sort_order !== undefined) url.searchParams.append('sort_order', params.sort_order)

  console.log('Searching products with URL:', url.toString())

  try {
    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error(`Failed to search products: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()
    console.log('API Response received:', {
      total: data.total,
      limit: data.limit,
      offset: data.offset,
      items_count: data.items?.length || 0
    })
    
    // Transform the API response to ensure median_price_all_retailers is never undefined
    const transformedData = {
      ...data,
      items: data.items.map((item: any) => ({
        ...item,
        median_price_all_retailers: item.median_price_all_retailers ?? null
      }))
    }
    
    return transformedData
  } catch (error) {
    console.error('Error searching products:', error)
    throw error
  }
}
