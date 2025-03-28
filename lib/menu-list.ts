import {
  Package,
  Workflow,
  User,
  LucideIcon
} from "lucide-react";

type Menu = {
  href: string;
  label: string;
  active?: boolean;
  icon: LucideIcon;
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
          active: pathname.startsWith("/products")
        },
        {
          href: "/scripts",
          label: "Spider Scripts",
          icon: Workflow,
          active: pathname.startsWith("/scripts")
        }
      ]
    }
  ];
}
