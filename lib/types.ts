// lib/types.ts

// Warehouse Types
export type Warehouse = 'byggmakker' | 'monter' | 'maxbo'

export interface Script {
  id: number // Changed from string to number
  name: string
  description: string
  warehouse: Warehouse
  filename: string
}

export interface Job {
  id: number
  job_id: string
  script_id: number // This should be a number
  cron_expression: string
  enabled: boolean
  created_at: string
}

export interface Log {
  id: number
  level: 'info' | 'warning' | 'error'
  message: string
  timestamp: string
}

export interface LogFilters {
  level?: string
  skip?: number
  limit?: number
}

export interface ScriptExecution {
  execution_id: number
  script_id: number
  timestamp: string
  status: 'pending' | 'completed' | 'failed'
}

export interface RunScriptResponse {
  message: string
  job_id: number
  execution_id: number
  status: 'completed' | 'failed'
  error?: string
}

export interface Script {
  id: number
  name: string
  description: string
  warehouse: Warehouse
  filename: string
  lastExecution?: ScriptExecution // Add this to track last execution
}

export interface ProductImage {
  image_id: number
  image_url: string
}

export interface Product {
  product_id: number
  nobb_code: string
  base_name: string
  base_unit: string
  base_price_unit: string
  created: string
  updated: string
  images: ProductImage[]
}

export interface RetailerProduct {
  retailer_id: number
  product_id: number
  retailer_name: string
  product_url?: string
  price: number
  currency: string
  last_updated: string
}

export interface RetailerStats {
  retailer_id: number
  retailer_name: string
  average_price: number
  min_price: number
  max_price: number
  store_count: number
}

export interface ProductPriceStats {
  product: Product
  median_price_all_retailers: number
  retailer_stats: RetailerStats[]
  retailer_products?: RetailerProduct[]
}

export interface RetailerProductCount {
  retailer_id: number
  retailer_name: string
  total_products: number
}

export interface BasicStats {
  total_products: number
  total_retailers: number
  retailer_product_counts: RetailerProductCount[]
}

// API Response Types
export interface ProductsResponse {
  data: Product[]
  error?: string
}

export interface ProductPriceResponse {
  data: ProductPriceStats
  error?: string
}
