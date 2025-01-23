'use client'

import { useState, useEffect } from 'react'
import { Search } from 'lucide-react'
import { Input } from '@/components/ui/input'

interface SearchBarProps {
  onSearch: (query: string) => void
  placeholder?: string
}

export function SearchBar({
  onSearch,
  placeholder = 'Search...',
}: SearchBarProps) {
  const [query, setQuery] = useState('')

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      onSearch(query)
    }, 300) // 300ms debounce

    return () => clearTimeout(debounceTimer)
  }, [query, onSearch])

  return (
    <div className="relative w-full max-w-xl">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
          className="pl-10"
        />
      </div>
    </div>
  )
}
