"use client"

import { useQuery } from "@tanstack/react-query"
import { Info, Loader2, Package2 } from "lucide-react"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { getBasicStats } from "@/lib/api/products"

export function ProductStatsPopover() {
  // Fetch basic stats
  const { data: stats, isLoading: isLoadingStats } = useQuery({
    queryKey: ['basic-stats'],
    queryFn: getBasicStats,
    refetchOnWindowFocus: false,
  })

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="ml-2 h-8 w-8" aria-label="Product statistics">
          <Info className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <div className="space-y-4">
          <h3 className="font-medium text-lg">Product Statistics</h3>
          
          {isLoadingStats ? (
            <div className="flex items-center justify-center p-4">
              <Loader2 className="h-5 w-5 animate-spin" />
            </div>
          ) : stats ? (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Package2 className="h-5 w-5 text-muted-foreground" />
                <span className="text-muted-foreground">
                  Total Products:
                </span>
                <span className="font-bold">
                  {stats.total_products.toLocaleString()}
                </span>
              </div>
              
              <div className="space-y-2">
                <div className="font-medium text-muted-foreground">
                  Products per retailer:
                </div>
                <div className="max-h-60 overflow-y-auto pr-2">
                  <div className="grid gap-2">
                    {stats.retailer_product_counts.map((retailer) => (
                      <div
                        key={retailer.retailer_id}
                        className="flex justify-between items-center text-sm border-b last:border-0 pb-2 last:pb-0"
                      >
                        <span className="font-medium">
                          {retailer.retailer_name}
                        </span>
                        <span className="text-muted-foreground">
                          {retailer.total_products.toLocaleString()} products
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-muted-foreground">
              Failed to load product statistics
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}
