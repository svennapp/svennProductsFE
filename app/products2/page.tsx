"use client"

import { useReducer, useEffect, useCallback } from 'react'
import { SortingState } from '@tanstack/react-table'
import { useQuery } from '@tanstack/react-query'

import { columns } from './columns'
import { DataTable } from './data-table'
import { ProductStatsPopover } from './product-stats-popover'
import { searchProducts, SortField, SortOrder } from '@/lib/api/product-search'

// Define the state type
type TableState = {
  pageIndex: number;
  pageSize: number;
  sortingState: SortingState;
  searchTerm: string;
}

// Define action types
type TableAction = 
  | { type: 'SET_PAGE_INDEX'; payload: number }
  | { type: 'SET_PAGE_SIZE'; payload: number }
  | { type: 'SET_SORTING'; payload: SortingState }
  | { type: 'SET_SEARCH_TERM'; payload: string }
  | { type: 'RESET_PAGINATION' };

// Reducer function
function tableReducer(state: TableState, action: TableAction): TableState {
  switch (action.type) {
    case 'SET_PAGE_INDEX':
      return { ...state, pageIndex: action.payload };
    case 'SET_PAGE_SIZE':
      return { ...state, pageSize: action.payload, pageIndex: 0 };
    case 'SET_SORTING':
      return { ...state, sortingState: action.payload, pageIndex: 0 };
    case 'SET_SEARCH_TERM':
      return { ...state, searchTerm: action.payload, pageIndex: 0 };
    case 'RESET_PAGINATION':
      return { ...state, pageIndex: 0 };
    default:
      return state;
  }
}

// Minimum search length required (must match the value in data-table.tsx)
const MIN_SEARCH_LENGTH = 2;

export default function Products2Page() {
  // Initial state
  const initialState: TableState = {
    pageIndex: 0,
    pageSize: 20,
    sortingState: [],
    searchTerm: "",
  };

  // Use reducer for state management
  const [state, dispatch] = useReducer(tableReducer, initialState);
  const { pageIndex, pageSize, sortingState, searchTerm } = state;

  // Calculate offset from page index
  const offset = pageIndex * pageSize;

  // Convert TanStack Table sorting to API sorting parameters
  const getSortParams = useCallback((): { sort_by?: SortField; sort_order?: SortOrder } => {
    if (sortingState.length === 0) return {};

    const column = sortingState[0].id;
    const direction = sortingState[0].desc ? "desc" : "asc";

    // Map column IDs to API sort fields
    const sortFieldMap: Record<string, SortField> = {
      base_name: "name",
      median_price_all_retailers: "price",
      retailer_count: "retailer_count",
    };

    const sortField = sortFieldMap[column];
    if (!sortField) return {};

    return {
      sort_by: sortField,
      sort_order: direction,
    };
  }, [sortingState]);

  // Determine if we should fetch data based on search term
  const shouldFetch = !searchTerm || searchTerm.length >= MIN_SEARCH_LENGTH;

  // Fetch products with the search API
  const {
    data: searchResults,
    isLoading,
    isError,
    error,
    isFetching,
  } = useQuery({
    queryKey: ["products-search-v2", pageIndex, pageSize, sortingState, searchTerm],
    queryFn: async () => {
      if (searchTerm && searchTerm.length < MIN_SEARCH_LENGTH) {
        // Return empty results if search term is too short
        return {
          items: [],
          total: 0,
          limit: pageSize,
          offset: 0,
          has_more: false
        };
      }
      
      const { sort_by, sort_order } = getSortParams();
      console.log("Fetching data for page:", pageIndex, "with offset:", offset);
      
      return searchProducts({
        q: searchTerm || undefined, // Only send if not empty
        limit: pageSize,
        offset: offset,
        sort_by,
        sort_order,
      });
    },
    enabled: shouldFetch, // Only run query if search term is valid
    refetchOnWindowFocus: false,
  });

  // Handle pagination changes
  const handlePaginationChange = useCallback((newPageIndex: number, newPageSize: number) => {
    console.log("Pagination change:", { newPageIndex, newPageSize, currentPageIndex: pageIndex });
    
    // If page size changes, reset to first page
    if (newPageSize !== pageSize) {
      dispatch({ type: 'SET_PAGE_SIZE', payload: newPageSize });
    } else {
      dispatch({ type: 'SET_PAGE_INDEX', payload: newPageIndex });
    }
  }, [pageIndex, pageSize]);

  // Handle sorting changes
  const handleSortingChange = useCallback((newSorting: SortingState) => {
    dispatch({ type: 'SET_SORTING', payload: newSorting });
  }, []);

  // Handle search changes
  const handleSearchChange = useCallback((newSearchTerm: string) => {
    dispatch({ type: 'SET_SEARCH_TERM', payload: newSearchTerm });
  }, []);

  // Calculate page count
  const pageCount = searchResults
    ? Math.ceil(searchResults.total / pageSize)
    : 0;

  // For debugging
  useEffect(() => {
    console.log("Page component state:", { 
      pageIndex, 
      offset,
      isLoading, 
      isFetching,
      dataReceived: !!searchResults,
      itemCount: searchResults?.items?.length || 0,
      searchTerm,
      searchTermLength: searchTerm?.length || 0,
      shouldFetch
    });
  }, [pageIndex, offset, isLoading, isFetching, searchResults, searchTerm, shouldFetch]);

  // Display error message if API request fails
  if (isError && shouldFetch) {
    return (
      <div className="container mx-auto py-10">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">{(error as Error).message || "Failed to load products"}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10">
      <div className="flex items-center mb-5">
        <h1 className="text-2xl font-bold">Products</h1>
        <ProductStatsPopover />
      </div>
      <DataTable
        columns={columns}
        data={searchResults?.items || []}
        pageCount={pageCount}
        pageIndex={pageIndex}
        pageSize={pageSize}
        totalItems={searchResults?.total || 0}
        onPaginationChange={handlePaginationChange}
        onSortingChange={handleSortingChange}
        onSearchChange={handleSearchChange}
        isLoading={isLoading || isFetching}
      />
    </div>
  );
}
