"use client"

import AdminLayout from "@/components/admin-layout"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ordersAPI, partnersAPI } from "@/lib/api"
import { ArrowLeft, CheckCircle, Clock, Loader2, MapPin, Package, Phone, User, XCircle } from "lucide-react"
import { useParams, useRouter } from "next/navigation"
import React, { useEffect, useState } from "react"
import { toast } from "sonner"

interface Order {
  _id: string
  customer: string
  customerPhone: string
  pickupAddress: string
  deliveryAddress: string
  status: string
  assignedTo?: {
    _id:string,
    name:string
  }
  items: string[]
  createdAt: string
}

interface Partner {
  _id: string
  name: string
  email: string
  phone: string
  status: string
  vehicleType: string
  assignedOrders: string[]
}

export default function AssignOrderPage() {
  const router = useRouter()
  const params = useParams()
  const orderId = params.id as string

  const [order, setOrder] = useState<Order | null>(null)
  const [partners, setPartners] = useState<Partner[]>([])
  const [allPartners, setAllPartners] = useState<Partner[]>([])
  const [selectedPartnerId, setSelectedPartnerId] = useState<string>("")
  const [isLoading, setIsLoading] = useState(true)
  const [isAssigning, setIsAssigning] = useState(false)
  const [isUnassigning, setIsUnassigning] = useState(false)

  const fetchOrderAndPartners = React.useCallback(async () => {
    try {
      setIsLoading(true)
      const [orderResponse, partnersResponse] = await Promise.all([
        ordersAPI.getById(orderId),
        partnersAPI.getAll()
      ])

      if (orderResponse.success) {
        setOrder(orderResponse.data)
      }
      if (partnersResponse.success) {
        const availablePartners = partnersResponse.data.filter((partner: Partner) =>
          partner.status === 'AVAILABLE'
        )
        setPartners(availablePartners)
        setAllPartners(partnersResponse.data)
      }
    } catch (error) {
      console.error("Error fetching data:", error)
      const errorMessage = error instanceof Error ? error.message : "Failed to fetch order details"
      toast.error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }, [orderId])

  useEffect(() => {
    fetchOrderAndPartners()
  }, [fetchOrderAndPartners])

  const handleAssign = async () => {
    if (!selectedPartnerId) {
      toast.error("Please select a partner")
      return
    }

    try {
      setIsAssigning(true)
      const response = await ordersAPI.assign(orderId, selectedPartnerId)

      if (response.success) {
        toast.success("Order assigned successfully")
        await fetchOrderAndPartners()
        setSelectedPartnerId("")
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to assign order"
      toast.error(errorMessage)
    } finally {
      setIsAssigning(false)
    }
  }

  const handleUnassign = async () => {
    try {
      setIsUnassigning(true)
      const response = await ordersAPI.unassign(orderId)

      if (response.success) {
        toast.success("Order unassigned successfully")
        await fetchOrderAndPartners()
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to unassign order"
      toast.error(errorMessage)
    } finally {
      setIsUnassigning(false)
    }
  }

  const handleAutoAssign = async () => {
    try {
      setIsAssigning(true)
      const response = await ordersAPI.assign(orderId, "")

      if (response.success) {
        toast.success("Order auto-assigned successfully")
        await fetchOrderAndPartners()
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to auto-assign order"
      toast.error(errorMessage)
    } finally {
      setIsAssigning(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'assigned': return 'bg-blue-100 text-blue-800'
      case 'picked_up': return 'bg-purple-100 text-purple-800'
      case 'delivered': return 'bg-green-100 text-green-800'
      case 'cancelled': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending': return <Clock className="h-4 w-4" />
      case 'assigned': return <CheckCircle className="h-4 w-4" />
      case 'delivered': return <CheckCircle className="h-4 w-4" />
      case 'cancelled': return <XCircle className="h-4 w-4" />
      default: return <Clock className="h-4 w-4" />
    }
  }

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </AdminLayout>
    )
  }

  if (!order) {
    return (
      <AdminLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Order Not Found</h1>
            <Button onClick={() => router.push("/admin/orders")}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Orders
            </Button>
          </div>
        </div>
      </AdminLayout>
    )
  }
  const assignedPartner = order.assignedTo ? allPartners.find(p => p._id === order.assignedTo!._id as string) : undefined
  return (
    <AdminLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => router.push(`/admin/orders/${orderId}`)}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Orders
          </Button>
          <h1 className="text-3xl font-bold text-gray-900">Assign Order</h1>
          <p className="text-gray-600 mt-2">Order ID: {order._id}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Order Details
                <Badge className={`flex items-center gap-1 ${getStatusColor(order.status)}`}>
                  {getStatusIcon(order.status)}
                  {order.status.toUpperCase()}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <User className="h-4 w-4 text-gray-500" />
                  <div>
                    <p className="font-medium">{order.customer}</p>
                    <p className="text-sm text-gray-500">Customer</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Phone className="h-4 w-4 text-gray-500" />
                  <div>
                    <p className="font-medium">{order.customerPhone}</p>
                    <p className="text-sm text-gray-500">Phone</p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-start space-x-2">
                  <MapPin className="h-4 w-4 text-green-500 mt-1" />
                  <div>
                    <p className="font-medium text-sm text-green-700">Pickup Address</p>
                    <p className="text-sm text-gray-600">{order.pickupAddress}</p>
                  </div>
                </div>
                <div className="flex items-start space-x-2">
                  <MapPin className="h-4 w-4 text-red-500 mt-1" />
                  <div>
                    <p className="font-medium text-sm text-red-700">Delivery Address</p>
                    <p className="text-sm text-gray-600">{order.deliveryAddress}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Package className="h-4 w-4 text-gray-500" />
                  <span className="font-medium">Items ({order.items.length})</span>
                </div>
                <div className="ml-6 space-y-1">
                  {order.items.map((item, index) => (
                    <div key={index} className="text-sm text-gray-600 flex items-center">
                      <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                      {item}
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-2 border-t">
                <p className="text-sm text-gray-500">
                  Created: {new Date(order.createdAt).toLocaleString()}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Assignment Management</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {order.assignedTo ? (
                <div className="space-y-4">
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <h3 className="font-medium text-blue-900 mb-3 flex items-center">
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Currently Assigned To:
                    </h3>
                    {assignedPartner ? (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <p className="font-medium text-blue-800">{assignedPartner.name}</p>
                          <Badge variant="secondary">{assignedPartner.vehicleType}</Badge>
                        </div>
                        <p className="text-sm text-blue-700">{assignedPartner.phone}</p>
                        <p className="text-sm text-blue-700">{assignedPartner.email}</p>
                        <p className="text-xs text-blue-600">
                          Active Orders: {assignedPartner.assignedOrders.length}
                        </p>
                      </div>
                    ) : (
                      <div className="text-sm text-blue-700 bg-yellow-50 p-2 rounded border border-yellow-200">
                        ⚠️ Partner details not found (Partner may have been deleted)
                      </div>
                    )}
                  </div>

                  <Button
                    onClick={handleUnassign}
                    disabled={isUnassigning}
                    variant="destructive"
                    className="w-full"
                  >
                    {isUnassigning ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Unassigning...
                      </>
                    ) : (
                      <>
                        <XCircle className="h-4 w-4 mr-2" />
                        Unassign Order
                      </>
                    )}
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-yellow-800 text-sm flex items-center">
                      <Clock className="h-4 w-4 mr-2" />
                      This order is not assigned to any delivery partner
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Select Delivery Partner
                    </label>
                    <Select value={selectedPartnerId} onValueChange={setSelectedPartnerId}>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose a partner" />
                      </SelectTrigger>
                      <SelectContent>
                        {partners.length === 0 ? (
                          <div className="p-2 text-sm text-gray-500 text-center">
                            No available partners found
                          </div>
                        ) : (
                          partners.map((partner) => (
                            <SelectItem key={partner._id} value={partner._id}>
                              <div className="flex flex-col">
                                <span className="font-medium">{partner.name}</span>
                                <span className="text-sm text-gray-500">
                                  {partner.phone} • {partner.vehicleType} • {partner.assignedOrders.length} orders
                                </span>
                              </div>
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Button
                      onClick={handleAssign}
                      disabled={isAssigning || !selectedPartnerId || partners.length === 0}
                      className="w-full"
                    >
                      {isAssigning ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Assigning...
                        </>
                      ) : (
                        <>
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Assign to Selected Partner
                        </>
                      )}
                    </Button>

                    <Button
                      onClick={handleAutoAssign}
                      disabled={isAssigning || partners.length === 0}
                      variant="outline"
                      className="w-full"
                    >
                      {isAssigning ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Auto-assigning...
                        </>
                      ) : (
                        <>
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Auto-assign to Available Partner
                        </>
                      )}
                    </Button>

                    {partners.length === 0 && (
                      <div className="text-center p-4 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-600 mb-2">No available delivery partners found</p>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => router.push("/admin/partners")}
                        >
                          Manage Partners
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Assignment History or Stats could go here */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Assignment Guidelines</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="p-3 bg-blue-50 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-1">Manual Assignment</h4>
                <p className="text-blue-700">Select a specific partner from the dropdown list</p>
              </div>
              <div className="p-3 bg-green-50 rounded-lg">
                <h4 className="font-medium text-green-900 mb-1">Auto Assignment</h4>
                <p className="text-green-700">System will find the best available partner</p>
              </div>
              <div className="p-3 bg-yellow-50 rounded-lg">
                <h4 className="font-medium text-yellow-900 mb-1">Unassignment</h4>
                <p className="text-yellow-700">Remove current assignment and make order pending</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  )
}
