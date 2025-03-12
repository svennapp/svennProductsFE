'use client'

import { usePathname } from 'next/navigation'
import { AppSidebar } from './app-sidebar'
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"

export function Navigation() {
  const pathname = usePathname()
  const isAuthPage =
    pathname?.startsWith('/login') || pathname?.startsWith('/signup')

  if (isAuthPage) return null
  
  // Extract the current page name from pathname
  const getPageName = () => {
    if (pathname === '/') return 'Scripts'
    if (pathname === '/products') return 'View Products'
    return pathname?.split('/').pop() || ''
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink href="/">
                    Svenn Products
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage>{getPageName()}</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
        <div className="flex-1 p-4">
          {/* Content will be rendered here by the page */}
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
