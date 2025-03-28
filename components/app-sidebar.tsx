"use client"

import * as React from "react"
import {
  Activity,
  Package,
  Search,
  User,
  Workflow,
} from "lucide-react"

import { NavMain } from "@/components/nav-main"
import { NavProjects } from "@/components/nav-projects"
import { NavUser } from "@/components/nav-user"
import { TeamSwitcher } from "@/components/team-switcher"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
} from "@/components/ui/sidebar"

const data = {
  user: {
    name: "User",
    email: "user@example.com",
    avatar: "/avatars/user.jpg",
  },
  teams: [
    {
      name: "Svenn Products",
      logo: Package,
      plan: "Enterprise",
    },
  ],
  navMain: [
    {
      title: "Products",
      url: "/products",
      icon: Package,
      isActive: true,
      items: [
        {
          title: "View Products",
          url: "/products",
        },
      ],
    },
    {
      title: "Spider Scripts",
      url: "/scripts",
      icon: Workflow,
      items: [
        {
          title: "View Scripts",
          url: "/scripts",
        },
        {
          title: "Run History",
          url: "/scripts/history",
        },
      ],
    },
    {
      title: "Account",
      url: "/account",
      icon: User,
      items: [
        {
          title: "Profile",
          url: "/account",
        },
      ],
    },
  ],
  projects: [],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={data.teams} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>
  )
}
