"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { LayoutDashboard, LogOut, Map, Menu, Package, User, X } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

export default function PartnerLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  useEffect(() => {
    const user = localStorage.getItem("user")
    if (!user) {
      router.push("/login")
      return
    }

    const userData = JSON.parse(user)
    if (userData.role !== "partner" && userData.role !== "PARTNER") {
      router.push("/login")
    }
  }, [router])

  const handleLogout = () => {
    localStorage.removeItem("user")
    router.push("/login")
  }

  useEffect(() => {
    const checkTokenExpiry = () => {
      const user = localStorage.getItem("user")
      if (user) {
        const userData = JSON.parse(user)
        const loginTime = userData.loginTime || Date.now()
        const twentyFourHours = 24 * 60 * 60 * 1000

        if (Date.now() - loginTime > twentyFourHours) {
          handleLogout()
        }
      }
    }

    checkTokenExpiry()

    const interval = setInterval(checkTokenExpiry, 60 * 60 * 1000)

    return () => clearInterval(interval)
  }, [router])

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Mobile sidebar backdrop */}
      {isSidebarOpen && (
        <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={() => setIsSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r transform transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static lg:z-auto ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between h-16 px-4 border-b">
            <Link href="/partner/dashboard" className="flex items-center">
              <Package className="h-6 w-6 text-primary mr-2" />
              <span className="font-bold text-lg">Rentkar Partner</span>
            </Link>
            <Button variant="ghost" size="icon" onClick={() => setIsSidebarOpen(false)} className="lg:hidden">
              <X className="h-5 w-5" />
            </Button>
          </div>
          <nav className="flex-1 p-4 space-y-1">
            <Link
              href="/partner/dashboard"
              className="flex items-center px-4 py-2 text-gray-700 rounded-md hover:bg-gray-100"
            >
              <LayoutDashboard className="h-5 w-5 mr-3" />
              Dashboard
            </Link>
            <Link
              href="/partner/dashboard?tab=assigned"
              className="flex items-center px-4 py-2 text-gray-700 rounded-md hover:bg-gray-100"
            >
              <Package className="h-5 w-5 mr-3" />
              Assigned Orders
            </Link>
            <Link
              href="/partner/dashboard?tab=map"
              className="flex items-center px-4 py-2 text-gray-700 rounded-md hover:bg-gray-100"
            >
              <Map className="h-5 w-5 mr-3" />
              Delivery Map
            </Link>
            <Link
              href="/partner/profile"
              className="flex items-center px-4 py-2 text-gray-700 rounded-md hover:bg-gray-100"
            >
              <User className="h-5 w-5 mr-3" />
              Profile
            </Link>
          </nav>
          <div className="p-4 border-t">
            <Button variant="outline" className="w-full justify-start" onClick={handleLogout}>
              <LogOut className="h-5 w-5 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col">
        <header className="h-16 border-b bg-white flex items-center px-4 lg:px-6">
          <Button variant="ghost" size="icon" onClick={() => setIsSidebarOpen(true)} className="lg:hidden">
            <Menu className="h-5 w-5" />
          </Button>
          <div className="ml-auto flex items-center space-x-2">
            <span className="text-sm font-medium">Delivery Partner</span>
          </div>
        </header>
        <main className="flex-1">{children}</main>
      </div>
    </div>
  )
}
