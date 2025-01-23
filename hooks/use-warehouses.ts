'use client'

import { useState, useEffect } from 'react'
import { apiClient } from '@/lib/api-client'
import { API_ROUTES } from '@/lib/config'
import type { WarehouseResponse } from '@/lib/types'

export function useWarehouses() {
  const [warehouses, setWarehouses] = useState<WarehouseResponse[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchWarehouses() {
      try {
        setIsLoading(true)
        const data = await apiClient.get<WarehouseResponse[]>(API_ROUTES.warehouses)
        setWarehouses(data)
        setError(null)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch warehouses')
        setWarehouses([])
      } finally {
        setIsLoading(false)
      }
    }

    fetchWarehouses()
  }, [])

  return {
    warehouses,
    isLoading,
    error
  }
}
