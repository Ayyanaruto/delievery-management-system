"use client"

import AdminLayout from "@/components/admin-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { ordersAPI } from "@/lib/api"
import type { Order } from "@/types/order"
import { ArrowLeft, Edit, MapPin, Trash2 } from "lucide-react"
import dynamic from "next/dynamic"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

const OrderMap = dynamic(() => import("@/components/order-map"), {
  ssr: false,
  loading: () => <div className="h-64 bg-gray-100 rounded-md flex items-center justify-center">Loading map...</div>
})

export default function OrderDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter()
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [resolvedParams, setResolvedParams] = useState<{ id: string } | null>(null)

  useEffect(() => {
    const resolveParams = async () => {
      const resolved = await params
      setResolvedParams(resolved)
    }
    resolveParams()
  }, [params])

  useEffect(() => {
    if (!resolvedParams) return

    const fetchOrder = async () => {
      try {
        setLoading(true)
        setError(null)
        const response = await ordersAPI.getById(resolvedParams.id)
        if (response.success && response.data) {
          setOrder(response.data)
        } else {
          setError("Order not found")
        }
      } catch (err) {
        console.error("Error fetching order:", err)
        setError(err instanceof Error ? err.message : "Failed to load order")
      } finally {
        setLoading(false)
      }
    }

    fetchOrder()
  }, [resolvedParams])

  const handleDeleteOrder = async () => {
    if (!resolvedParams || !window.confirm("Are you sure you want to delete this order? This action cannot be undone.")) {
      return
    }

    setDeleting(true)
    try {
      await ordersAPI.delete(resolvedParams.id)
      router.push("/admin/dashboard")
    } catch (err) {
      console.error("Error deleting order:", err)
      setError(err instanceof Error ? err.message : "Failed to delete order")
    } finally {
      setDeleting(false)
    }
  }

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex-1 p-8">
          <p>Loading order details...</p>
        </div>
      </AdminLayout>
    )
  }

  if (error || !order) {
    return (
      <AdminLayout>
        <div className="flex-1 p-8">
          <h2 className="text-2xl font-bold">{error || "Order not found"}</h2>
          <Button className="mt-4" onClick={() => router.push("/admin/dashboard")}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
          </Button>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Button variant="ghost" onClick={() => router.push("/admin/dashboard")} className="mr-4">
              <ArrowLeft className="mr-2 h-4 w-4" /> Back
            </Button>
            <h2 className="text-3xl font-bold tracking-tight">Order #{order._id || order.id}</h2>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push(`/admin/orders/${order._id || order.id}/update`)}
            >
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleDeleteOrder}
              disabled={deleting}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              {deleting ? "Deleting..." : "Delete"}
            </Button>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Order Information</CardTitle>
              <CardDescription>Details about this delivery order</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Status</p>
                  <p className="mt-1">
                    <span
                      className={`px-2 py-1 text-xs font-semibold rounded-full
                      ${
                        order.status === "pending"
                          ? "bg-yellow-100 text-yellow-800"
                          : order.status === "assigned"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-green-100 text-green-800"
                      }`}
                    >
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </span>
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Created At</p>
                  <p className="mt-1">{new Date(order.createdAt).toLocaleString()}</p>
                </div>
              </div>

              <div>
                <p className="text-sm font-medium text-gray-500">Customer</p>
                <p className="mt-1">{order.customer}</p>
              </div>

              <div>
                <p className="text-sm font-medium text-gray-500">Customer Phone</p>
                <p className="mt-1">{order.customerPhone}</p>
              </div>

              <div>
                <p className="text-sm font-medium text-gray-500">Pickup Address</p>
                <p className="mt-1 flex items-start">
                  <MapPin className="mr-1 h-4 w-4 text-gray-400 mt-0.5" />
                  {order.pickupAddress}
                </p>
              </div>

              <div>
                <p className="text-sm font-medium text-gray-500">Delivery Address</p>
                <p className="mt-1 flex items-start">
                  <MapPin className="mr-1 h-4 w-4 text-gray-400 mt-0.5" />
                  {order.deliveryAddress}
                </p>
              </div>

              {order.assignedTo && (
                <div>
                  <p className="text-sm font-medium text-gray-500">Assigned Partner</p>
                  <p className="mt-1">
                    {typeof order.assignedTo === 'object' && order.assignedTo !== null && 'name' in order.assignedTo
                      ? (order.assignedTo as { name: string }).name
                      : 'Partner details not available'
                    }
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Items</CardTitle>
              <CardDescription>Items included in this order</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {order.items.map((item: string, index: number) => (
                  <li key={index} className="flex items-center">
                    <span className="h-2 w-2 rounded-full bg-primary mr-2"></span>
                    {item}
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter>
              {(order.status === "pending" || order.status === "assigned") && (
                <Button className="w-full" onClick={() => router.push(`/admin/orders/${order._id || order.id}/assign`)}>
                  {order.status === "pending" ? "Assign to Delivery Partner" : "Manage Assignment"}
                </Button>
              )}
            </CardFooter>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Route Map</CardTitle>
            <CardDescription>Pickup and delivery locations</CardDescription>
          </CardHeader>
          <CardContent>
            <OrderMap
              pickupAddress={order.pickupAddress}
              deliveryAddress={order.deliveryAddress}
              pickupCoords={order.pickupAddressCord}
              deliveryCoords={order.deliveryAddressCord}
            />
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  )
}
