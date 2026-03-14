"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Bot,
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
import { LogOut } from "lucide-react"
import { cn } from "@/lib/utils"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { signOut, useSession } from "@/lib/auth-client"

const navItems = [
  { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  {title: "Chat", href: "/chat", icon:Bot},
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
  const { data: session } = useSession()
  const [profileVersion, setProfileVersion] = useState(0)

  useEffect(() => {
    const handler = () => {
      setProfileVersion((version) => version + 1)
    }
    window.addEventListener("profile-updated", handler)
    return () => window.removeEventListener("profile-updated", handler)
  }, [])

  const displayName = useMemo(() => {
    const stored =
      typeof window !== "undefined"
        ? localStorage.getItem("profileName")
        : null
    return (
      stored ||
      session?.user?.name ||
      session?.user?.email ||
      "Campus User"
    )
  }, [profileVersion, session?.user?.email, session?.user?.name])

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
        {/* {!isCollapsed && (
          <div className="rounded-md border border-sidebar-border/60 bg-sidebar-accent/40 px-2 py-2 text-xs text-sidebar-foreground/70">
            Quick access to your core tools.
          </div>
        )} */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="flex items-center gap-3 rounded-md border border-sidebar-border/60 bg-sidebar-accent/10 px-2 py-2 text-left text-sm hover:bg-sidebar-accent/50"
            >
          <img
            src={`https://api.dicebear.com/7.x/thumbs/svg?seed=${encodeURIComponent(
              displayName
            )}`}
                alt={displayName}
                className="size-8 rounded-full border border-sidebar-border/60 "
              />
              {!isCollapsed && (
                <div className="flex min-w-0 flex-1 flex-col">
                  <span className="truncate font-medium">{displayName}</span>
                  {/* <span className="text-xs text-sidebar-foreground/70">
                    View account
                  </span> */}
                </div>
              )}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent side="top" align="start">
            <DropdownMenuItem
              onSelect={(event) => {
                event.preventDefault()
                signOut()
              }}
            >
              <LogOut className="size-4" />
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
