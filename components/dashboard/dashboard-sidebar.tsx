"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ChevronsUpDown, ExternalLink, LogOut } from "lucide-react";

import { useSession } from "@/components/auth/session-provider";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  useSidebar,
} from "@/components/ui/sidebar";
import { dashboardNav, isActive } from "@/lib/dashboard-nav";
import { siteConfig } from "@/lib/site-config";
import type { SessionUser } from "@/types/auth";
import { initials } from "@/lib/miami-time";

export function DashboardSidebar({ user }: { user: SessionUser }) {
  const pathname = usePathname();
  const router = useRouter();
  const { signOut } = useSession();
  const { setOpenMobile } = useSidebar();

  const groups = dashboardNav(user);

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="h-18 justify-center px-3">
        <Link
          href="/"
          className="flex items-center gap-2.5 overflow-hidden transition-opacity hover:opacity-85 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:gap-0"
          onClick={() => setOpenMobile(false)}
        >
          <Image
            src="/brand/omomoom-mark.png"
            alt=""
            width={64}
            height={64}
            priority
            className="size-9 shrink-0"
          />
          <span className="min-w-0 group-data-[collapsible=icon]:hidden">
            <span className="font-heading block truncate text-base leading-tight font-extrabold">
              {siteConfig.name}
            </span>
            <span className="text-muted-foreground block truncate text-xs">
              Your Miami food map
            </span>
          </span>
        </Link>
      </SidebarHeader>

      <SidebarContent>
        {groups.map((group) => (
          <SidebarGroup key={group.label} className="px-3">
            <SidebarGroupLabel className="text-muted-foreground px-2 text-[11px] font-semibold tracking-widest uppercase">
              {group.label}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu className="gap-0.5">
                {group.items.map((item) => (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive(pathname, item)}
                      tooltip={item.label}
                      className="h-10 rounded-xl px-2.5 font-medium transition-colors data-[active=true]:bg-card data-[active=true]:text-brand-ink data-[active=true]:font-semibold hover:bg-card/70 group-data-[collapsible=icon]:size-10! group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0!"
                    >
                      <Link
                        href={item.href}
                        onClick={() => setOpenMobile(false)}
                      >
                        <item.icon className="size-4.5!" />
                        <span className="flex-1 truncate group-data-[collapsible=icon]:hidden">
                          {item.label}
                        </span>
                        {item.soon ? (
                          <Badge
                            variant="outline"
                            className="text-muted-foreground h-4.5 px-1.5 text-[10px] group-data-[collapsible=icon]:hidden"
                          >
                            Soon
                          </Badge>
                        ) : null}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarFooter className="p-3">
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  size="lg"
                  tooltip={user.name}
                  className="bg-card/60 hover:bg-card h-14 rounded-2xl px-2.5 ring-1 ring-foreground/5 transition-colors data-[state=open]:bg-card group-data-[collapsible=icon]:size-10! group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:rounded-xl group-data-[collapsible=icon]:px-0! group-data-[collapsible=icon]:ring-0"
                >
                  <Avatar className="size-9 shrink-0 group-data-[collapsible=icon]:size-8">
                    {user.avatarUrl ? (
                      <AvatarImage src={user.avatarUrl} alt="" />
                    ) : null}
                    <AvatarFallback className="bg-tint-rose text-tint-rose-ink text-xs font-bold">
                      {initials(user.name)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="grid flex-1 text-left leading-tight group-data-[collapsible=icon]:hidden">
                    <span className="truncate text-sm font-semibold">
                      {user.name}
                    </span>
                    <span className="text-muted-foreground truncate text-xs">
                      @{user.username}
                    </span>
                  </span>
                  <ChevronsUpDown className="ml-auto size-4 group-data-[collapsible=icon]:hidden" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>

              <DropdownMenuContent side="top" align="start" className="min-w-56">
                <DropdownMenuItem asChild>
                  <Link href="/">
                    <ExternalLink />
                    Back to Omomoom
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  variant="destructive"
                  onSelect={async (event) => {
                    event.preventDefault();
                    await signOut();
                    router.push("/");
                  }}
                >
                  <LogOut />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}
