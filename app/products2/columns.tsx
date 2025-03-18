"use client"

import { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown, MoreHorizontal, ImageOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import Image from "next/image"

// Define the product type based on the search API response
export type Product = {
  product_id: number
  base_name: string
  base_unit: string
  nobb_code: string
  ean_code: string | null
  images: Array<{
    image_id: number
    image_url: string
  }>
  retailer_count: number
  median_price_all_retailers: number | null
}

export const columns: ColumnDef<Product>[] = [
  {
    id: "thumbnail",
    header: "Image",
    cell: ({ row }) => {
      const product = row.original
      const imageUrl = product.images && product.images.length > 0
        ? product.images[0].image_url
        : null

      return (
        <div className="flex items-center justify-center h-12 w-12 relative">
          {imageUrl ? (
            <div className="relative h-10 w-10 overflow-hidden rounded-md border">
              <Image
                src={imageUrl}
                alt={product.base_name}
                fill
                sizes="40px"
                className="object-cover"
                onError={(e) => {
                  // Show fallback on error
                  e.currentTarget.style.display = 'none'
                  const parent = e.currentTarget.parentElement
                  if (parent) {
                    const fallback = document.createElement('div')
                    fallback.className = 'flex items-center justify-center h-full w-full bg-muted'
                    const icon = document.createElement('span')
                    icon.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-muted-foreground"><line x1="2" y1="2" x2="22" y2="22"></line><path d="M10.41 10.41a2 2 0 1 1-2.83-2.83"></path><line x1="13.5" y1="13.5" x2="6" y2="21"></line><line x1="18" y1="12" x2="21" y2="15"></line><path d="M3.59 3.59A1.99 1.99 0 0 0 3 5v14a2 2 0 0 0 2 2h14c.55 0 1.052-.22 1.41-.59"></path><path d="M21 15V5a2 2 0 0 0-2-2H9"></path></svg>'
                    fallback.appendChild(icon)
                    parent.appendChild(fallback)
                  }
                }}
              />
            </div>
          ) : (
            <div className="flex items-center justify-center h-10 w-10 rounded-md border bg-muted">
              <ImageOff className="h-5 w-5 text-muted-foreground" />
            </div>
          )}
        </div>
      )
    },
  },
  {
    accessorKey: "base_name",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Product Name
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
  },
  {
    accessorKey: "nobb_code",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          NOBB
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
  },
  {
    accessorKey: "ean_code",
    header: "EAN",
    cell: ({ row }) => {
      const eanCode = row.getValue("ean_code") as string | null
      return <div>{eanCode || "—"}</div>
    },
  },
  {
    accessorKey: "median_price_all_retailers",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Median Price
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const price = row.getValue("median_price_all_retailers") as number | null
      const product = row.original
      
      // Format the price as NOK currency
      const formatted = price 
        ? new Intl.NumberFormat("nb-NO", {
            style: "currency",
            currency: "NOK",
          }).format(price)
        : "N/A"

      // Add the unit to the price display
      const priceWithUnit = price 
        ? `${formatted} /${product.base_unit}`
        : "N/A"

      return <div className="text-right font-medium">{priceWithUnit}</div>
    },
  },
  {
    accessorKey: "retailer_count",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Retailers
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      return <div className="text-center">{row.getValue("retailer_count")}</div>
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const product = row.original

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() => navigator.clipboard.writeText(product.product_id.toString())}
            >
              Copy product ID
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>View details</DropdownMenuItem>
            <DropdownMenuItem>View retailers</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
]
