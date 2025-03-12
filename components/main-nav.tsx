'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { signOut } from 'next-auth/react'
import { cn } from '@/lib/utils'
import { Activity, Package, LogOut, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar"

const navigation = [
  { 
    title: 'Scripts', 
    url: '/', 
    icon: Activity,
    items: [] 
  },
  { 
    title: 'View Products', 
    url: '/products', 
    icon: Package,
    items: [] 
  },
]

export function MainNav() {
  const pathname = usePathname()
  const router = useRouter()

  // Map navigation items and mark active based on pathname
  const navItems = navigation.map(item => ({
    ...item,
    isActive: pathname === item.url
  }))

  const handleLogout = async () => {
    try {
      await signOut({
        redirect: true,
        callbackUrl: '/login',
      })
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Svenn Products</SidebarGroupLabel>
      <SidebarMenu>
        {navItems.map((item) => (
          <Collapsible
            key={item.title}
            asChild
            defaultOpen={item.isActive}
            className="group/collapsible"
          >
            <SidebarMenuItem>
              <CollapsibleTrigger asChild>
                <SidebarMenuButton tooltip={item.title} asChild>
                  <Link href={item.url}>
                    {item.icon && <item.icon />}
                    <span>{item.title}</span>
                    {item.items && item.items.length > 0 && (
                      <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                    )}
                  </Link>
                </SidebarMenuButton>
              </CollapsibleTrigger>
              {item.items && item.items.length > 0 && (
                <CollapsibleContent>
                  <SidebarMenuSub>
                    {item.items?.map((subItem) => (
                      <SidebarMenuSubItem key={subItem.title}>
                        <SidebarMenuSubButton asChild>
                          <Link href={subItem.url}>
                            <span>{subItem.title}</span>
                          </Link>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    ))}
                  </SidebarMenuSub>
                </CollapsibleContent>
              )}
            </SidebarMenuItem>
          </Collapsible>
        ))}
      </SidebarMenu>
      <div className="mt-auto px-4 py-2">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleLogout}
                className="text-muted-foreground hover:text-primary"
              >
                <LogOut className="h-5 w-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Logout</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </SidebarGroup>
  )
}
