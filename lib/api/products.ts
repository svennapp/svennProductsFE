// lib/api/products.ts
import {
  ProductsResponse,
  ProductPriceResponse,
  BasicStats,
  LatestProduct,
} from '../types'
import { API_BASE_URL } from '../config'

// Updated routes to match your FastAPI structure
export const PRODUCT_ROUTES = {
  byCategory: (categoryId: string) =>
    `${API_BASE_URL}/api/products/category/${categoryId}`,
  search: `${API_BASE_URL}/api/products/product-info`,
  stats: `${API_BASE_URL}/api/products/stats/basic`,
  latest: `${API_BASE_URL}/api/products/latest`,
}

export async function getProductsByCategory(
  categoryId: string,
  skip = 0,
  limit = 100
): Promise<ProductsResponse> {
  const url = new URL(PRODUCT_ROUTES.byCategory(categoryId))
  url.searchParams.append('skip', skip.toString())
  url.searchParams.append('limit', limit.toString())

  const response = await fetch(url.toString(), {
    headers: {
      'Content-Type': 'application/json',
    },
  })

  if (!response.ok) {
    const error = await response
      .json()
      .catch(() => ({ detail: 'Failed to fetch products' }))
    throw new Error(error.detail || 'Failed to fetch products')
  }

  const data = await response.json()
  return { data }
}

export async function getProductPrices(
  code: string,
  identifierType: 'nobb' | 'ean' = 'nobb'
): Promise<ProductPriceResponse> {
  const url = new URL(PRODUCT_ROUTES.search)
  url.searchParams.append('identifier_type', identifierType)
  url.searchParams.append('code', code)

  const response = await fetch(url.toString(), {
    headers: {
      'Content-Type': 'application/json',
    },
  })

  if (!response.ok) {
    const error = await response
      .json()
      .catch(() => ({ detail: 'Failed to fetch product prices' }))
    throw new Error(error.detail || 'Failed to fetch product prices')
  }

  const data = await response.json()
  return { data }
}

export async function getBasicStats(): Promise<BasicStats> {
  const response = await fetch(PRODUCT_ROUTES.stats, {
    headers: {
      'Content-Type': 'application/json',
    },
  })

  if (!response.ok) {
    const error = await response
      .json()
      .catch(() => ({ detail: 'Failed to fetch basic stats' }))
    throw new Error(error.detail || 'Failed to fetch basic stats')
  }

  return response.json()
}

export async function getLatestProducts(
  skip = 0,
  limit = 20
): Promise<{ data: LatestProduct[] }> {
  const url = new URL(PRODUCT_ROUTES.latest)
  url.searchParams.append('skip', skip.toString())
  url.searchParams.append('limit', limit.toString())

  const response = await fetch(url.toString(), {
    headers: {
      'Content-Type': 'application/json',
    },
  })

  if (!response.ok) {
    const error = await response
      .json()
      .catch(() => ({ detail: 'Failed to fetch latest products' }))
    throw new Error(error.detail || 'Failed to fetch latest products')
  }

  const data = await response.json()
  return { data }
}
