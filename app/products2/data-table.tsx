"use client"

import { useState, useEffect, useRef } from "react"
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
} from "@tanstack/react-table"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Loader2, Search, AlertCircle, X } from "lucide-react"

import { Product } from "./columns"
import { ProductDetailsModal } from "./product-details-modal"

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  pageCount: number
  pageIndex: number
  pageSize: number
  totalItems: number
  onPaginationChange: (pageIndex: number, pageSize: number) => void
  onSortingChange: (sorting: SortingState) => void
  onSearchChange: (searchTerm: string) => void
  isLoading: boolean
}

export function DataTable<TData, TValue>({
  columns,
  data,
  pageCount,
  pageIndex,
  pageSize,
  totalItems,
  onPaginationChange,
  onSortingChange,
  onSearchChange,
  isLoading,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [searchValue, setSearchValue] = useState("")
  const [isSearching, setIsSearching] = useState(false)
  const [searchError, setSearchError] = useState<string | null>(null)
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)
  
  // State for product details modal
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  
  // Minimum search length required
  const MIN_SEARCH_LENGTH = 2
  
  // Handle sorting changes
  useEffect(() => {
    onSortingChange(sorting)
  }, [sorting, onSortingChange])

  // Handle search with debounce
  const handleSearchInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = event.target.value
    setSearchValue(newValue)
    setSearchError(null)
    
    // Clear any existing timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current)
    }
    
    // If search is empty, clear the search immediately
    if (newValue === "") {
      onSearchChange("")
      setIsSearching(false)
      return
    }
    
    // Check if search meets minimum length requirement
    if (newValue.length < MIN_SEARCH_LENGTH) {
      setSearchError(`Search must be at least ${MIN_SEARCH_LENGTH} characters`)
      return
    }
    
    // Set searching state immediately for visual feedback
    setIsSearching(true)
    
    // Debounce the actual search
    searchTimeoutRef.current = setTimeout(() => {
      onSearchChange(newValue)
      setIsSearching(false)
    }, 500) // 500ms debounce
  }
  
  // Clear search function
  const handleClearSearch = () => {
    setSearchValue("")
    setSearchError(null)
    onSearchChange("")
    setIsSearching(false)
    
    // Focus the input after clearing
    if (searchInputRef.current) {
      searchInputRef.current.focus()
    }
  }
  
  // Handle row click to open product details
  const handleRowClick = (product: Product) => {
    setSelectedProduct(product)
    setIsModalOpen(true)
  }
  
  // Close modal function
  const handleCloseModal = () => {
    setIsModalOpen(false)
  }
  
  // Clean up timeout on unmount
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current)
      }
    }
  }, [])

  const table = useReactTable({
    data,
    columns,
    pageCount: pageCount,
    state: {
      sorting,
      columnFilters,
      pagination: {
        pageIndex,
        pageSize,
      },
    },
    manualPagination: true,
    manualSorting: true,
    manualFiltering: true,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  })

  // For debugging
  useEffect(() => {
    console.log("DataTable render:", { 
      isLoading, 
      dataLength: data.length,
      pageIndex,
      pageSize,
      pageCount
    })
    
    // Maintain focus on search input when data changes
    if (document.activeElement !== searchInputRef.current && searchInputRef.current) {
      // Only restore focus if the input was previously focused
      if (document.activeElement?.tagName === 'BODY' || 
          document.activeElement?.getAttribute('data-was-search-input') === 'true') {
        searchInputRef.current.focus()
      }
    }
  }, [isLoading, data, pageIndex, pageSize, pageCount])

  return (
    <div>
      <div className="flex items-center justify-between py-4">
        <div className="relative max-w-sm w-full">
          <Input
            ref={searchInputRef}
            placeholder={`Search products (min ${MIN_SEARCH_LENGTH} characters)...`}
            value={searchValue}
            onChange={handleSearchInputChange}
            className="pr-10"
            disabled={isLoading}
            data-was-search-input="true"
            onBlur={(e) => {
              // Mark the element that's receiving focus
              if (e.relatedTarget) {
                e.relatedTarget.setAttribute('data-was-search-input', 'true')
              }
            }}
          />
          <div className="absolute inset-y-0 right-0 flex items-center pr-3">
            {isSearching || isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground pointer-events-none" />
            ) : searchError ? (
              <AlertCircle className="h-4 w-4 text-destructive pointer-events-none" />
            ) : searchValue ? (
              <X 
                className="h-4 w-4 text-muted-foreground hover:text-foreground cursor-pointer" 
                onClick={handleClearSearch}
                aria-label="Clear search"
              />
            ) : (
              <Search className="h-4 w-4 text-muted-foreground pointer-events-none" />
            )}
          </div>
          {searchError && (
            <div className="text-xs text-destructive mt-1">
              {searchError}
            </div>
          )}
        </div>
        <div className="text-sm text-muted-foreground">
          {totalItems > 0 ? (
            <>
              Showing {pageIndex * pageSize + 1} to{" "}
              {Math.min((pageIndex + 1) * pageSize, totalItems)} of {totalItems} products
            </>
          ) : isLoading ? (
            "Loading products..."
          ) : (
            "No products found"
          )}
        </div>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                  <div className="mt-2">Loading products...</div>
                </TableCell>
              </TableRow>
            ) : table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => handleRowClick(row.original as Product)}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  {searchValue ? "No products found matching your search." : "No products available."}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-between space-x-2 py-4">
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPaginationChange(0, pageSize)}
            disabled={pageIndex === 0 || isLoading}
          >
            First
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPaginationChange(pageIndex - 1, pageSize)}
            disabled={pageIndex === 0 || isLoading}
          >
            Previous
          </Button>
        </div>
        <div className="flex items-center space-x-2">
          <div className="text-sm text-muted-foreground">
            Page {pageIndex + 1} of {Math.max(1, pageCount)}
          </div>
          <select
            className="border rounded p-1 text-sm"
            value={pageSize}
            onChange={(e) => onPaginationChange(0, Number(e.target.value))}
            disabled={isLoading}
          >
            {[10, 20, 30, 40, 50].map((size) => (
              <option key={size} value={size}>
                {size} per page
              </option>
            ))}
          </select>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPaginationChange(pageIndex + 1, pageSize)}
            disabled={pageIndex >= pageCount - 1 || isLoading}
          >
            Next
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPaginationChange(pageCount - 1, pageSize)}
            disabled={pageIndex >= pageCount - 1 || isLoading}
          >
            Last
          </Button>
        </div>
      </div>
      
      {/* Product Details Modal */}
      <ProductDetailsModal 
        product={selectedProduct}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />
    </div>
  )
}
