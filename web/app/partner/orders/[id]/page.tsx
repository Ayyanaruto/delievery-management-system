"use client"

import PartnerLayout from "@/components/partner-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ordersAPI } from "@/lib/api"
import type { Order } from "@/types/order"
import { ArrowLeft, MapPin, Phone, User } from "lucide-react"
import dynamic from "next/dynamic"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

const OrderMap = dynamic(() => import("@/components/order-map"), {
  ssr: false,
  loading: () => <div className="h-64 bg-gray-100 rounded-md flex items-center justify-center">Loading map...</div>
})

interface PageProps {
  params: Promise<{ id: string }>
}

export default function PartnerOrderDetailsPage({ params }: PageProps) {
  const router = useRouter()
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [resolvedParams, setResolvedParams] = useState<{ id: string } | null>(null)

  useEffect(() => {
    const resolveParams = async () => {
      try {
        const resolved = await params
        setResolvedParams(resolved)
      } catch (err) {
        console.error("Error resolving params:", err)
        setError("Failed to load page parameters")
      }
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

  if (loading) {
    return (
      <PartnerLayout>
        <div className="flex-1 p-8">
          <p>Loading order details...</p>
        </div>
      </PartnerLayout>
    )
  }

  if (error || !order) {
    return (
      <PartnerLayout>
        <div className="flex-1 p-8">
          <h2 className="text-2xl font-bold">{error || "Order not found"}</h2>
          <Button className="mt-4" onClick={() => router.push("/partner/dashboard")}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
          </Button>
        </div>
      </PartnerLayout>
    )
  }

  return (
    <PartnerLayout>
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Button variant="ghost" onClick={() => router.push("/partner/dashboard")} className="mr-4">
              <ArrowLeft className="mr-2 h-4 w-4" /> Back
            </Button>
            <h2 className="text-3xl font-bold tracking-tight">Order #{order._id || order.id}</h2>
          </div>
          <div className="flex gap-2">
            <span
              className={`px-3 py-1 text-sm font-semibold rounded-full
              ${
                order.status === "pending"
                  ? "bg-yellow-100 text-yellow-800"
                  : order.status === "assigned"
                    ? "bg-blue-100 text-blue-800"
                    : order.status === "in_progress"
                      ? "bg-orange-100 text-orange-800"
                      : "bg-green-100 text-green-800"
              }`}
            >
              {order.status === "in_progress" ? "In Progress" : order.status.charAt(0).toUpperCase() + order.status.slice(1)}
            </span>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Customer Information</CardTitle>
              <CardDescription>Details about the customer</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <User className="h-4 w-4 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-500">Customer Name</p>
                  <p className="mt-1 font-medium">{order.customer}</p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Phone className="h-4 w-4 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-500">Phone Number</p>
                  <p className="mt-1">{order.customerPhone}</p>
                </div>
              </div>

              <div>
                <p className="text-sm font-medium text-gray-500">Order Created</p>
                <p className="mt-1">{new Date(order.createdAt).toLocaleString()}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Delivery Details</CardTitle>
              <CardDescription>Pickup and delivery information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium text-gray-500">Pickup Location</p>
                <p className="mt-1 flex items-start">
                  <MapPin className="mr-1 h-4 w-4 text-green-500 mt-0.5" />
                  {order.pickupAddress}
                </p>
              </div>

              <div>
                <p className="text-sm font-medium text-gray-500">Delivery Location</p>
                <p className="mt-1 flex items-start">
                  <MapPin className="mr-1 h-4 w-4 text-red-500 mt-0.5" />
                  {order.deliveryAddress}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Items to Deliver</CardTitle>
            <CardDescription>List of items included in this order</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {order.items.map((item: string, index: number) => (
                <div key={index} className="flex items-center p-3 bg-gray-50 rounded-lg">
                  <span className="h-3 w-3 rounded-full bg-primary mr-3"></span>
                  <span className="font-medium">{item}</span>
                </div>
              ))}
            </div>
            {order.items.length === 0 && (
              <p className="text-gray-500 text-center py-4">No items listed for this order</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Route Map</CardTitle>
            <CardDescription>Navigate from pickup to delivery location</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <OrderMap
              pickupAddress={order.pickupAddress}
              deliveryAddress={order.deliveryAddress}
              pickupCoords={order.pickupAddressCord}
              deliveryCoords={order.deliveryAddressCord}
            />
          </CardContent>
        </Card>
      </div>
    </PartnerLayout>
  )
}
