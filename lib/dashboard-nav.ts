import {
  BookOpen,
  CalendarDays,
  Camera,
  Compass,
  Flag,
  Images,
  LayoutDashboard,
  MapPin,
  Settings,
  ShieldCheck,
  Store,
  UserRound,
  Users,
  type LucideIcon,
} from "lucide-react";

import { isAdmin, isOwner, type SessionUser } from "@/types/auth";

export type DashboardNavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
  exact?: boolean;
  soon?: boolean;
};

export type DashboardNavGroup = {
  label: string;
  items: DashboardNavItem[];
};

export const profileTabs: DashboardNavItem[] = [
  { label: "Reviews", href: "/dashboard/profile", icon: BookOpen, exact: true },
  { label: "Photos", href: "/dashboard/profile/photos", icon: Camera },
  { label: "Places tried", href: "/dashboard/profile/tried", icon: MapPin },
  {
    label: "Want to try",
    href: "/dashboard/profile/want-to-try",
    icon: Compass,
  },
];

export function dashboardNav(user: SessionUser): DashboardNavGroup[] {
  const groups: DashboardNavGroup[] = [
    {
      label: "You",
      items: [
        {
          label: "Overview",
          href: "/dashboard",
          icon: LayoutDashboard,
          exact: true,
        },
        {
          label: "Your food map",
          href: "/dashboard/profile",
          icon: UserRound,
        },
        { label: "Settings", href: "/dashboard/settings", icon: Settings },
      ],
    },
  ];

  if (isOwner(user)) {
    groups.push({
      label: "Your restaurant",
      items: [
        { label: "Overview", href: "/dashboard/restaurant", icon: Store, exact: true },
        {
          label: "Photos",
          href: "/dashboard/restaurant/photos",
          icon: Images,
          soon: true,
        },
        {
          label: "Details & hours",
          href: "/dashboard/restaurant/details",
          icon: BookOpen,
          soon: true,
        },
      ],
    });
  }

  if (isAdmin(user)) {
    groups.push({
      label: "Admin",
      items: [
        {
          label: "Restaurants",
          href: "/dashboard/admin/restaurants",
          icon: Store,
        },
        { label: "Users", href: "/dashboard/admin/users", icon: Users },
        {
          label: "Claims",
          href: "/dashboard/admin/claims",
          icon: ShieldCheck,
        },
        { label: "Events", href: "/dashboard/admin/events", icon: CalendarDays },
        {
          label: "Moderation",
          href: "/dashboard/admin/moderation",
          icon: Flag,
        },
      ],
    });
  }

  return groups;
}

export function isActive(pathname: string, item: DashboardNavItem): boolean {
  return item.exact ? pathname === item.href : pathname.startsWith(item.href);
}
