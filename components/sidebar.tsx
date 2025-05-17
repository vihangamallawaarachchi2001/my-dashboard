"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  BarChart3,
  Calendar,
  CheckSquare,
  ClipboardList,
  LayoutDashboard,
  LineChart,
  ListTodo,
  Target,
} from "lucide-react"

const navItems = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Tasks", href: "/tasks", icon: ListTodo },
  { name: "Time Blocks", href: "/time-blocks", icon: Calendar },
  { name: "Habits", href: "/habits", icon: CheckSquare },
  { name: "Goals", href: "/goals", icon: Target },
  { name: "Journal", href: "/journal", icon: ClipboardList },
  { name: "Reports", href: "/reports", icon: BarChart3 },
  { name: "Daily Tracker", href: "/daily-tracker", icon: LineChart },
]

export default function Sidebar() {
  const pathname = usePathname()

  return (
    <div className="hidden md:flex flex-col w-64 border-r border-border bg-gradient-to-b from-background to-secondary/20 h-screen sticky top-0">
      <div className="p-4 border-b border-border">
        <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/70">
          Productivity Tracker
        </h1>
      </div>
      <div className="flex-1 py-4 flex flex-col gap-1 px-2">
        {navItems.map((item) => {
          const Icon = item.icon
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-md transition-all duration-200 hover:bg-secondary",
                pathname === item.href
                  ? "bg-primary/10 text-primary border-l-2 border-primary"
                  : "text-muted-foreground border-l-2 border-transparent",
              )}
            >
              <Icon className={cn("h-5 w-5", pathname === item.href ? "text-primary" : "text-muted-foreground")} />
              <span>{item.name}</span>
            </Link>
          )
        })}
      </div>
      <div className="p-4 border-t border-border">
        <div className="text-xs text-muted-foreground text-center">
          <p>Personal Productivity System</p>
          <p className="mt-1">© {new Date().getFullYear()}</p>
        </div>
      </div>
    </div>
  )
}
