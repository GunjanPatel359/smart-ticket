"use client"

import { usePathname } from "next/navigation"
import { useMemo } from "react"

interface BreadcrumbItem {
  label: string
  href: string
}

// Map of route segments to readable labels
const routeLabels: Record<string, string> = {
  admin: "Admin",
  technician: "Technician",
  user: "User",
  dashboard: "Dashboard",
  tickets: "Tickets",
  technicians: "Technicians",
  skills: "Skills",
  analytics: "Analytics",
  reports: "Reports",
  settings: "Settings",
  overview: "Overview",
  performance: "Performance",
  "create-ticket": "Create Ticket",
}

export function useBreadcrumbs(): BreadcrumbItem[] {
  const pathname = usePathname()

  return useMemo(() => {
    // Split pathname into segments and filter out empty strings
    const segments = pathname.split("/").filter(Boolean)

    // If we're at a role root (e.g., /admin, /technician, /user), no breadcrumbs needed
    if (segments.length <= 1) {
      return []
    }

    // Build breadcrumb items
    const breadcrumbs: BreadcrumbItem[] = []
    let currentPath = ""

    segments.forEach((segment, index) => {
      currentPath += `/${segment}`
      const label = routeLabels[segment] || segment.charAt(0).toUpperCase() + segment.slice(1)

      breadcrumbs.push({
        label,
        href: currentPath,
      })
    })

    return breadcrumbs
  }, [pathname])
}
