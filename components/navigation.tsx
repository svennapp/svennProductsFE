'use client'

import { usePathname } from 'next/navigation'
import { MainNav } from './main-nav'

export function Navigation() {
  const pathname = usePathname()
  const isAuthPage =
    pathname?.startsWith('/login') || pathname?.startsWith('/signup')

  if (isAuthPage) return null
  return <MainNav />
}
