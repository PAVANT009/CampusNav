"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  CalendarDays,
  LayoutDashboard,
  MapIcon,
  Settings,
} from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarSeparator,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar"
import { cn } from "@/lib/utils"

const navItems = [
  { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { title: "Map", href: "/map", icon: MapIcon },
  { title: "Events", href: "/events", icon: CalendarDays },
  { title: "Settings", href: "/settings", icon: Settings },
]
//handle the sidebar when its collapsed so if user clicks if should toggle
const handleCLickonDown = (isCollapsed : boolean,toggleSidebar : () => void) => {
    if(isCollapsed)  toggleSidebar()

}

export function AppSidebar() {
  const pathname = usePathname()
  const { state,toggleSidebar } = useSidebar()
  const isCollapsed = state === "collapsed"

  return (
    <Sidebar collapsible="icon" className="font-mono">
      <SidebarHeader>
      <div
        className={cn(
          "flex items-center gap-2 px-2","py-1.5"
        )}
      >
            {isCollapsed ? (
                <div className="flex size-8 items-center justify-center rounded-md text-sidebar-primary-foreground">
                <SidebarTrigger />
                </div>
            ) : (
              <></>
            )}
          <div className="flex min-w-0 flex-1 flex-col">
            <span className="truncate text-2xl font-semibold justify-start">CampusNav</span>
            {/* <span className="truncate text-xs text-sidebar-foreground/70">
              Control Center
            </span> */}
          </div>
          {!isCollapsed && <SidebarTrigger className="ml-auto" />}
        </div>
        <SidebarSeparator />
      </SidebarHeader>
      <SidebarContent onClick={() => handleCLickonDown(isCollapsed,toggleSidebar)}>
        <SidebarGroup >
          <SidebarGroupLabel>Workspace</SidebarGroupLabel>
          <SidebarMenu>
            {navItems.map((item) => {
              const isActive =
                pathname === item.href || pathname.startsWith(`${item.href}/`)

              return (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive}
                    tooltip={item.title}
                  >
                    <Link href={item.href}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )
            })}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <div className="rounded-md border border-sidebar-border/60 bg-sidebar-accent/40 px-2 py-2 text-xs text-sidebar-foreground/70">
          Quick access to your core tools.
        </div>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
