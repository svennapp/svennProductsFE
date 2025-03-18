import {
  Package,
  Workflow,
  Settings2,
  LogOut,
  LucideIcon
} from "lucide-react";

type Submenu = {
  href: string;
  label: string;
  active?: boolean;
};

type Menu = {
  href: string;
  label: string;
  active?: boolean;
  icon: LucideIcon;
  submenus?: Submenu[];
};

type Group = {
  groupLabel: string;
  menus: Menu[];
};

export function getMenuList(pathname: string): Group[] {
  return [
    {
      groupLabel: "Platform",
      menus: [
        {
          href: "/products",
          label: "Products",
          icon: Package,
          active: pathname.startsWith("/products"),
          submenus: [
            {
              href: "/products",
              label: "View Products",
              active: pathname === "/products"
            }
          ]
        },
        {
          href: "/scripts",
          label: "Spider Scripts",
          icon: Workflow,
          active: pathname.startsWith("/scripts"),
          submenus: [
            {
              href: "/scripts",
              label: "View Scripts",
              active: pathname === "/scripts"
            },
            {
              href: "/scripts/history",
              label: "Run History",
              active: pathname === "/scripts/history"
            }
          ]
        },
        {
          href: "/settings",
          label: "Settings",
          icon: Settings2,
          active: pathname.startsWith("/settings"),
          submenus: [
            {
              href: "/settings/general",
              label: "General",
              active: pathname === "/settings/general"
            },
            {
              href: "/settings/account",
              label: "Account",
              active: pathname === "/settings/account"
            }
          ]
        }
      ]
    }
  ];
}
