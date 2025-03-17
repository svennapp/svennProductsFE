"use client"

import { useState } from "react"
import Image from "next/image"
import { useQuery } from "@tanstack/react-query"
import { ExternalLink, Loader2, X } from "lucide-react"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

import { getProductInfo, ProductInfoResponse } from "@/lib/api/product-info"
import { Product } from "./columns"

interface ProductDetailsModalProps {
  product: Product | null
  isOpen: boolean
  onClose: () => void
}

export function ProductDetailsModal({ product, isOpen, onClose }: ProductDetailsModalProps) {
  const [activeTab, setActiveTab] = useState("overview")

  // Fetch product details when modal is open and we have a product
  const {
    data: productInfo,
    isLoading,
    isError,
    error
  } = useQuery({
    queryKey: ["product-info", product?.nobb_code],
    queryFn: () => getProductInfo({
      identifier_type: "nobb",
      code: product?.nobb_code || ""
    }),
    enabled: isOpen && !!product?.nobb_code,
    refetchOnWindowFocus: false,
  })

  // Format price as NOK
  const formatPrice = (price: number | undefined | null) => {
    if (price == null) return "N/A"
    return new Intl.NumberFormat("nb-NO", {
      style: "currency",
      currency: "NOK",
    }).format(price)
  }

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("nb-NO", {
      year: "numeric",
      month: "long",
      day: "numeric"
    })
  }

  // Helper function to get retailer name by ID
  const getRetailerName = (retailerId: number) => {
    if (!productInfo) return `Retailer ${retailerId}`
    
    const retailerStat = productInfo.retailer_stats.find(
      stat => stat.retailer_id === retailerId
    )
    
    return retailerStat?.retailer_name || `Retailer ${retailerId}`
  }

  if (!product) return null

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl">{product.base_name}</DialogTitle>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          <DialogDescription>
            NOBB: {product.nobb_code} {product.ean_code && `| EAN: ${product.ean_code}`}
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin mb-4" />
            <p>Loading product details...</p>
          </div>
        ) : isError ? (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
            <p className="font-semibold">Failed to load product details</p>
            <p className="text-sm">{(error as Error).message}</p>
          </div>
        ) : productInfo ? (
          <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="retailers">Retailers ({productInfo.retailer_stats.length})</TabsTrigger>
              <TabsTrigger value="variants">Variants ({productInfo.retailer_products.length})</TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview" className="mt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  {productInfo.product.images && productInfo.product.images.length > 0 ? (
                    <div className="relative h-64 w-full overflow-hidden rounded-md border mb-4">
                      <Image
                        src={productInfo.product.images[0].image_url}
                        alt={productInfo.product.base_name}
                        fill
                        className="object-contain"
                      />
                    </div>
                  ) : (
                    <div className="h-64 w-full bg-gray-100 flex items-center justify-center rounded-md border mb-4">
                      <p className="text-gray-500">No image available</p>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">NOBB Code</h3>
                      <p>{productInfo.product.nobb_code}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Unit</h3>
                      <p>{productInfo.product.base_unit}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Price Unit</h3>
                      <p>{productInfo.product.base_price_unit}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Product ID</h3>
                      <p>{productInfo.product.product_id}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Created</h3>
                      <p>{formatDate(productInfo.product.created)}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Updated</h3>
                      <p>{formatDate(productInfo.product.updated)}</p>
                    </div>
                  </div>
                </div>

                <div>
                  <Card>
                    <CardHeader>
                      <CardTitle>Price Information</CardTitle>
                      <CardDescription>Median and retailer prices</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <h3 className="text-sm font-medium text-gray-500">Median Price (All Retailers)</h3>
                          <p className="text-2xl font-bold">{formatPrice(productInfo.median_price_all_retailers)} <span className="text-sm font-normal">/{productInfo.product.base_unit}</span></p>
                        </div>
                        
                        <Separator />
                        
                        <div>
                          <h3 className="text-sm font-medium text-gray-500 mb-2">Retailer Price Range</h3>
                          {productInfo.retailer_stats.length > 0 ? (
                            <div className="space-y-3">
                              {productInfo.retailer_stats.map((stat) => (
                                <div key={stat.retailer_id} className="bg-gray-50 p-3 rounded-md">
                                  <div className="flex justify-between items-center mb-1">
                                    <h4 className="font-medium">{stat.retailer_name}</h4>
                                    <Badge variant="outline">{stat.store_count} {stat.store_count === 1 ? 'store' : 'stores'}</Badge>
                                  </div>
                                  <div className="grid grid-cols-3 gap-2 text-sm">
                                    <div>
                                      <p className="text-gray-500">Min</p>
                                      <p className="font-medium">{formatPrice(stat.min_price)}</p>
                                    </div>
                                    <div>
                                      <p className="text-gray-500">Average</p>
                                      <p className="font-medium">{formatPrice(stat.average_price)}</p>
                                    </div>
                                    <div>
                                      <p className="text-gray-500">Max</p>
                                      <p className="font-medium">{formatPrice(stat.max_price)}</p>
                                    </div>
                                  </div>
                                  <p className="text-xs text-gray-500 mt-1">Last updated: {formatDate(stat.last_updated)}</p>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-gray-500">No retailer price information available</p>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="retailers" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Retailer Statistics</CardTitle>
                  <CardDescription>Price and store information by retailer</CardDescription>
                </CardHeader>
                <CardContent>
                  {productInfo.retailer_stats.length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Retailer</TableHead>
                          <TableHead>Stores</TableHead>
                          <TableHead>Min Price</TableHead>
                          <TableHead>Average Price</TableHead>
                          <TableHead>Max Price</TableHead>
                          <TableHead>Last Updated</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {productInfo.retailer_stats.map((stat) => (
                          <TableRow key={stat.retailer_id}>
                            <TableCell className="font-medium">{stat.retailer_name}</TableCell>
                            <TableCell>{stat.store_count}</TableCell>
                            <TableCell>{formatPrice(stat.min_price)}</TableCell>
                            <TableCell>{formatPrice(stat.average_price)}</TableCell>
                            <TableCell>{formatPrice(stat.max_price)}</TableCell>
                            <TableCell>{formatDate(stat.last_updated)}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <p className="text-gray-500">No retailer statistics available</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="variants" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Product Variants</CardTitle>
                  <CardDescription>Different versions of this product across retailers</CardDescription>
                </CardHeader>
                <CardContent>
                  {productInfo.retailer_products.length > 0 ? (
                    <div className="space-y-4">
                      {productInfo.retailer_products.map((variant) => (
                        <div key={`${variant.retailer_id}-${variant.product_id}`} className="border rounded-md p-4">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <h3 className="font-medium">{variant.variant_name}</h3>
                              <p className="text-sm text-gray-500">{getRetailerName(variant.retailer_id)}</p>
                            </div>
                            {variant.url_product && (
                              <Button variant="outline" size="sm" asChild>
                                <a href={variant.url_product} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1">
                                  <ExternalLink className="h-3 w-3" />
                                  View
                                </a>
                              </Button>
                            )}
                          </div>
                          
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-3">
                            <div>
                              <p className="text-xs text-gray-500">Brand</p>
                              <p className="text-sm">{variant.brand || "N/A"}</p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500">Unit</p>
                              <p className="text-sm">{variant.retail_unit || "N/A"}</p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500">Price Comparison Unit</p>
                              <p className="text-sm">{variant.retail_price_comparison_unit || "N/A"}</p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500">Category ID</p>
                              <p className="text-sm">{variant.category_id}</p>
                            </div>
                          </div>
                          
                          <div className="flex justify-between text-xs text-gray-500 mt-3">
                            <p>Created: {formatDate(variant.created)}</p>
                            <p>Updated: {formatDate(variant.updated)}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500">No product variants available</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        ) : null}

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
