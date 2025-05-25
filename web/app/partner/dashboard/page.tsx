"use client"

import PartnerLayout from "@/components/partner-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "@/hooks/use-toast"
import { ordersAPI, partnersAPI } from "@/lib/api"
import { Order } from "@/types/order"
import type { Partner } from "@/types/partner"
import { CheckCircle, MapPin, Package, User } from "lucide-react"
import dynamic from "next/dynamic"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

const DeliveryMap = dynamic(() => import("@/components/order-map"), {
  ssr: false,
  loading: () => <div className="h-64 bg-gray-100 rounded-md flex items-center justify-center">Loading map...</div>
})

export default function PartnerDashboard() {
  const router = useRouter()
  const [assignedOrders, setAssignedOrders] = useState<Order[]>([])
  const [completedOrders, setCompletedOrders] = useState<Order[]>([])
  const [partnerInfo, setPartnerInfo] = useState<Partner | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token")
        const userStr = localStorage.getItem("user")

        if (!token || !userStr) {
          router.push("/login")
          return
        }

        const user = JSON.parse(userStr)
        if (!user.partnerId) {
          toast({
            title: "Error",
            description: "Partner information not found",
            variant: "destructive",
          })
          return
        }

        const partnerResponse = await partnersAPI.getById(user.partnerId)
        if (partnerResponse.success) {
          setPartnerInfo(partnerResponse.data)
        }

        const ordersResponse = await ordersAPI.getPartnerOrders(user.partnerId)
        const orders = ordersResponse.success ? ordersResponse.data || [] : []

        const assigned = orders.filter((order: Order) =>
          order.status === "assigned" || order.status === "in_progress"
        )
        const completed = orders.filter((order: Order) => order.status === "delivered")

        setAssignedOrders(assigned)
        setCompletedOrders(completed)
      } catch (error) {
        console.error("Error fetching partner data:", error)
        const errorMessage = error instanceof Error ? error.message : "Failed to load dashboard data"
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [router])

  const handleUpdateStatus = async (orderId: string, newStatus: string) => {
    try {
      const response = await ordersAPI.updateStatus(orderId, newStatus)

      if (!response.success) {
        throw new Error(response.message || "Failed to update status")
      }

      if (newStatus === "delivered") {
        const order = assignedOrders.find((o) => (o._id || o.id) === orderId)
        if (order) {
          setCompletedOrders((prev) => [...prev, { ...order, status: "delivered" as Order['status'] }])
          setAssignedOrders((prev) => prev.filter((o) => (o._id || o.id) !== orderId))
        }
      } else if (newStatus === "in_progress") {
        setAssignedOrders((prev) =>
          prev.map((o) =>
            (o._id || o.id) === orderId ? { ...o, status: "in_progress" as Order['status'] } : o
          )
        )
      }

      toast({
        title: "Status updated",
        description: `Order #${orderId} has been marked as ${newStatus.replace('_', ' ')}.`,
      })
    } catch (error) {
      console.error("Failed to update status:", error)
      const errorMessage = error instanceof Error ? error.message : "There was a problem updating the order status."
      toast({
        title: "Failed to update status",
        description: errorMessage,
        variant: "destructive",
      })
    }
  }

  const toggleAvailability = async () => {
    if (!partnerInfo) return

    try {
      const currentStatus = partnerInfo.status
      const newStatus = currentStatus === "AVAILABLE" ? "OFFLINE" : "AVAILABLE"

      const response = await partnersAPI.updateStatus(partnerInfo._id, newStatus)

      if (!response.success) {
        throw new Error(response.message || "Failed to update status")
      }

      setPartnerInfo((prev) => (prev ? { ...prev, status: newStatus as Partner['status'] } : null))

      toast({
        title: "Status updated",
        description: `You are now ${newStatus.toLowerCase()}.`,
      })
    } catch (error) {
      console.error("Failed to update availability:", error)
      toast({
        title: "Failed to update status",
        description: "There was a problem updating your availability status.",
        variant: "destructive",
      })
    }
  }

  if (loading) {
    return (
      <PartnerLayout>
        <div className="flex-1 p-8 flex items-center justify-center">
          <p>Loading dashboard data...</p>
        </div>
      </PartnerLayout>
    )
  }

  return (
    <PartnerLayout>
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold tracking-tight">Delivery Dashboard</h2>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => router.push("/partner/profile")}
            >
              <User className="mr-2 h-4 w-4" />
              Profile
            </Button>
            <Button
              variant={partnerInfo?.status === "AVAILABLE" ? "default" : "outline"}
              onClick={toggleAvailability}
            >
              {partnerInfo?.status === "AVAILABLE" ? "Available" : "Offline"}
            </Button>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Assigned Orders</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{assignedOrders.length}</div>
              <p className="text-xs text-muted-foreground">Orders waiting to be delivered</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed Orders</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{completedOrders.length}</div>
              <p className="text-xs text-muted-foreground">Successfully delivered orders</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Delivery Map</CardTitle>
            <CardDescription>View your assigned deliveries on the map</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <DeliveryMap orders={assignedOrders} />
          </CardContent>
        </Card>

        <Tabs defaultValue="assigned">
          <TabsList>
            <TabsTrigger value="assigned">Assigned Orders</TabsTrigger>
            <TabsTrigger value="completed">Completed Orders</TabsTrigger>
          </TabsList>
          <TabsContent value="assigned" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Assigned Orders</CardTitle>
                <CardDescription>Orders assigned to you for delivery</CardDescription>
              </CardHeader>
              <CardContent>
                {assignedOrders.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500">No assigned orders</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {assignedOrders.map((order) => {
                      const orderId = order._id || order.id || ""
                      return (
                        <div key={orderId} className="border rounded-lg p-4">
                          <div className="flex justify-between items-start mb-2">
                            <h3 className="font-medium">Order #{orderId}</h3>
                            <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                              {order.status?.charAt(0).toUpperCase() + order.status?.slice(1).replace('_', ' ') || "Assigned"}
                            </span>
                          </div>
                          <div className="space-y-2 mb-4">
                            <p className="text-sm">
                              <span className="font-medium">Customer:</span> {order.customer}
                            </p>
                            <p className="text-sm">
                              <span className="font-medium">Phone:</span> {order.customerPhone}
                            </p>
                            <div className="text-sm">
                              <span className="font-medium">Pickup:</span>
                              <div className="flex items-start mt-1">
                                <MapPin className="h-4 w-4 text-gray-400 mr-1 mt-0.5" />
                                <span>{order.pickupAddress}</span>
                              </div>
                            </div>
                            <div className="text-sm">
                              <span className="font-medium">Delivery:</span>
                              <div className="flex items-start mt-1">
                                <MapPin className="h-4 w-4 text-gray-400 mr-1 mt-0.5" />
                                <span>{order.deliveryAddress}</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex justify-end space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => router.push(`/partner/orders/${orderId}`)}
                            >
                              View Details
                            </Button>
                            {order.status === "assigned" && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleUpdateStatus(orderId, "in_progress")}
                              >
                                Mark as Picked Up
                              </Button>
                            )}
                            {order.status === "in_progress" && (
                              <Button
                                size="sm"
                                onClick={() => handleUpdateStatus(orderId, "delivered")}
                              >
                                Mark as Delivered
                              </Button>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="completed" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Completed Orders</CardTitle>
                <CardDescription>Orders you have successfully delivered</CardDescription>
              </CardHeader>
              <CardContent>
                {completedOrders.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500">No completed orders</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {completedOrders.map((order) => {
                      const orderId = order._id || order.id || ""
                      return (
                        <div key={orderId} className="border rounded-lg p-4">
                          <div className="flex justify-between items-start mb-2">
                            <h3 className="font-medium">Order #{orderId}</h3>
                            <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                              Delivered
                            </span>
                          </div>
                          <div className="space-y-2 mb-4">
                            <p className="text-sm">
                              <span className="font-medium">Customer:</span> {order.customer}
                            </p>
                            <div className="text-sm">
                              <span className="font-medium">Delivery:</span>
                              <div className="flex items-start mt-1">
                                <MapPin className="h-4 w-4 text-gray-400 mr-1 mt-0.5" />
                                <span>{order.deliveryAddress}</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex justify-end">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => router.push(`/partner/orders/${orderId}`)}
                            >
                              View Details
                            </Button>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </PartnerLayout>
  )
}
