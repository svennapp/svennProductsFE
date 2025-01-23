'use client'

import { useState, useEffect } from 'react'
import { apiClient } from '@/lib/api-client'
import { API_ROUTES } from '@/lib/config'
import type { Script } from '@/lib/types'

export function useWarehouseScripts(warehouseId: number | null) {
  const [scripts, setScripts] = useState<Script[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchScripts() {
      if (!warehouseId) {
        setScripts([])
        return
      }

      try {
        setIsLoading(true)
        const data = await apiClient.get<Script[]>(API_ROUTES.warehouseScripts(warehouseId))
        setScripts(data)
        setError(null)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch scripts')
        setScripts([])
      } finally {
        setIsLoading(false)
      }
    }

    fetchScripts()
  }, [warehouseId])

  return {
    scripts,
    isLoading,
    error
  }
}
