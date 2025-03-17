import { API_BASE_URL } from "@/lib/config"

export type IdentifierType = "nobb" | "ean"

export interface ProductInfoParams {
  identifier_type: IdentifierType
  code: string
}

export interface ProductImage {
  image_id: number
  image_url: string
}

export interface BaseProduct {
  base_name: string
  base_unit: string
  base_price_unit: string
  nobb_code: string
  product_id: number
  created: string
  updated: string
  images: ProductImage[]
}

export interface RetailerStat {
  retailer_id: number
  retailer_name: string
  average_price: number
  min_price: number
  max_price: number
  store_count: number
  last_updated: string
}

export interface RetailerProduct {
  retailer_id: number
  product_id: number
  variant_name: string
  brand: string
  url_product: string
  retail_unit: string
  retail_price_comparison_unit: string | null
  category_id: number
  created: string
  updated: string
}

export interface ProductInfoResponse {
  product: BaseProduct
  median_price_all_retailers: number
  retailer_stats: RetailerStat[]
  retailer_products: RetailerProduct[]
}

export async function getProductInfo(params: ProductInfoParams): Promise<ProductInfoResponse> {
  const url = new URL(`${API_BASE_URL}/api/products/product-info`)
  
  // Add query parameters
  url.searchParams.append("identifier_type", params.identifier_type)
  url.searchParams.append("code", params.code)
  
  const response = await fetch(url.toString())
  
  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`Failed to fetch product info: ${response.status} ${response.statusText} - ${errorText}`)
  }
  
  return response.json()
}
