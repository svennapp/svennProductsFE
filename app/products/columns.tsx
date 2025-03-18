"use client"

import { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown, MoreHorizontal } from "lucide-react"
import Image from "next/image"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

// Define the Product type based on the API response
export interface Product {
  product_id: number
  base_name: string
  base_unit: string
  nobb_code: string
  ean_code?: string | null
  images: {
    image_id: number
    image_url: string
  }[]
  median_price_all_retailers: number | null
  retailer_count: number
}

// Format price as NOK
const formatPrice = (price: number | undefined | null) => {
  if (price == null) return "N/A"
  return new Intl.NumberFormat("nb-NO", {
    style: "currency",
    currency: "NOK",
  }).format(price)
}

export const columns: ColumnDef<Product>[] = [
  // Thumbnail column
  {
    accessorKey: "thumbnail",
    header: "",
    cell: ({ row }) => {
      const product = row.original
      const imageUrl = product.images && product.images.length > 0
        ? product.images[0].image_url
        : null
      
      return (
        <div className="flex items-center justify-center w-12 h-12 relative">
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={product.base_name}
              fill
              className="object-contain"
            />
          ) : (
            <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-400 text-xs">
              No image
            </div>
          )}
        </div>
      )
    },
  },
  // Product name column
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
    cell: ({ row }) => {
      const name = row.getValue("base_name") as string
      return <div className="font-medium">{name}</div>
    },
  },
  // NOBB code column
  {
    accessorKey: "nobb_code",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          NOBB Code
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const nobbCode = row.getValue("nobb_code") as string
      return <div className="font-mono text-sm">{nobbCode}</div>
    },
  },
  // EAN code column
  {
    accessorKey: "ean_code",
    header: "EAN Code",
    cell: ({ row }) => {
      const eanCode = row.getValue("ean_code") as string | null | undefined
      return <div className="font-mono text-sm">{eanCode || "-"}</div>
    },
  },
  // Median price column
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
      const unit = row.original.base_unit
      
      return (
        <div className="text-right font-medium">
          {formatPrice(price)} {unit ? `/${unit}` : ""}
        </div>
      )
    },
  },
  // Retailer count column
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
      const count = row.getValue("retailer_count") as number
      return <div className="text-center">{count}</div>
    },
  },
  // Actions column
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
              onClick={() => navigator.clipboard.writeText(product.nobb_code)}
            >
              Copy NOBB code
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>View details</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
]
