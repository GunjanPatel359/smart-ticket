"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  TicketIcon,
  UserIcon,
  ChartBarIcon,
  ClockIcon,
  CheckCircleIcon,
  Cog6ToothIcon,
  PlusIcon,
  QueueListIcon,
  TrophyIcon,
  ChatBubbleLeftRightIcon,
  Bars3Icon,
  XMarkIcon,
  CalendarIcon,
  ArrowTrendingUpIcon,
  BellIcon,
  MagnifyingGlassIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  Squares2X2Icon
} from "@heroicons/react/24/outline"

import { useRouter } from "next/navigation"
import { getAdminToken } from "@/lib/authmiddleware"

type UserRole = "user" | "admin" | "technician"

const admin = [
    { name: "Dashboard", href: "/admin/dashboard", icon: ChartBarIcon },
    { name: "Skills", href: "/admin/skills", icon:  Squares2X2Icon},
    { name: "Tickets", href: "/admin/tickets", icon: TicketIcon },
    { name: "Technicians", href: "/admin/technicians", icon: UserIcon },
    { name: "Analytics", href: "/admin/analytics", icon: ArrowTrendingUpIcon },
    { name: "Reports", href: "/admin/reports", icon: CalendarIcon },
    { name: "Settings", href: "/admin/settings", icon: Cog6ToothIcon },
]

export default function ITSupportDashboard({children}:{ children: React.ReactNode }) {
  const router=useRouter()
  const [isAdmin, setIsAdmin] = useState(false)
  const currentRole = "admin"
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [showRoleSwitcher, setShowRoleSwitcher] = useState(false)
  const navigation = admin

  useEffect(()=>{
    const validateAdmin=async()=>{
      try {
        const adminToken = await getAdminToken()
        if (adminToken) {
          setIsAdmin(true)
        }else{
          router.push("/login")
        }
      } catch (error) {
        console.error(error)
      }
    }
    validateAdmin()
  },[])

  // const renderDashboardContent = () => {
  //   return (
  //       <>
  //       {}
  //       </>
  //   )
  // }

  return (
    <>
    <div className="flex h-screen bg-background">
      <div
        className={`${sidebarCollapsed ? "w-16" : "w-64"} bg-card border-r border-border transition-all duration-300`}
      >
        <div className={sidebarCollapsed ? "p-4 mt-4" : "p-6"}>
          <div className="flex items-center justify-between">
            {!sidebarCollapsed && (
              <div>
                <h1 className="text-xl font-bold text-foreground">IT Support Pro</h1>
                <p className="text-sm text-muted-foreground">AI-Powered Platform</p>
              </div>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="h-8 w-8 p-0 cursor-pointer"
            >
              {sidebarCollapsed ? <Bars3Icon className="h-4 w-4" /> : <XMarkIcon className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        <nav className="px-3 space-y-1">
          {!sidebarCollapsed && (
            <p className="px-3 text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">Navigation</p>
          )}
          {navigation.map((item) => (
            <Button
              key={item.name}
              variant="ghost"
              className={`w-full ${sidebarCollapsed ? "justify-center px-2" : "justify-start"}`}
              asChild
            >
              <a href={item.href} className="flex items-center gap-3">
                <item.icon className="h-4 w-4 flex-shrink-0" />
                {!sidebarCollapsed && <span>{item.name}</span>}
              </a>
            </Button>
          ))}
        </nav>
      </div>

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-card border-b border-border px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-foreground capitalize">
                  Admin Console
              </h2>
              <p className="text-sm text-muted-foreground">
                {currentRole === "admin" && "Comprehensive IT support management and analytics"}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <Button variant="outline" size="sm">
                <BellIcon className="h-4 w-4 mr-2" />
                Notifications
              </Button>
              <Avatar>
                <AvatarImage src="/user-profile-illustration.png" />
                <AvatarFallback>
                  AD
                </AvatarFallback>
              </Avatar>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-auto p-6">{children}</main>
        {/* <main className="flex-1 overflow-auto p-6">{renderDashboardContent()}</main> */}
      </div>

      <div className="fixed bottom-6 left-6 z-50">
        <div className="relative">
          {showRoleSwitcher && (
            <div className="absolute bottom-full mb-2 bg-card border border-border rounded-lg shadow-lg p-2 min-w-[120px]">
              <p className="text-xs font-medium text-muted-foreground mb-2 px-2">Switch Role</p>
              {(["admin", "technician", "user"] as UserRole[]).map((role) => (
                <Button
                  key={role}
                  variant={currentRole === role ? "default" : "ghost"}
                  size="sm"
                  onClick={() => {
                    router.push("/"+role)
                    setShowRoleSwitcher(false)
                  }}
                  className="w-full justify-start capitalize mb-1"
                >
                  {role}
                </Button>
              ))}
            </div>
          )}
          <Button
            onClick={() => setShowRoleSwitcher(!showRoleSwitcher)}
            className="rounded-full h-12 w-12 shadow-lg"
            size="sm"
          >
            <UserIcon className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
    </>
  )
}
