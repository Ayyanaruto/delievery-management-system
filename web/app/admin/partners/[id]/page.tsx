"use client"
import AdminLayout from "@/components/admin-layout"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { partnersAPI } from "@/lib/api"
import { DELIVERY_PARTNER_STATUS, type Partner } from "@/types/partner"
import { ArrowLeft, Calendar, Mail, Phone, Truck } from "lucide-react"
import { useParams, useRouter } from "next/navigation"
import { useEffect, useState } from "react"

const getStatusColor = (status: string) => {
  switch (status.toUpperCase()) {
    case DELIVERY_PARTNER_STATUS.AVAILABLE:
      return "bg-green-100 text-green-800"
    case DELIVERY_PARTNER_STATUS.OFFLINE:
      return "bg-gray-100 text-gray-800"
    case DELIVERY_PARTNER_STATUS.ON_BREAK:
      return "bg-yellow-100 text-yellow-800"
    case DELIVERY_PARTNER_STATUS.ON_DELIVERY:
      return "bg-blue-100 text-blue-800"
    case DELIVERY_PARTNER_STATUS.ASSIGNED:
      return "bg-purple-100 text-purple-800"
    default:
      return "bg-gray-100 text-gray-800"
  }
}

export default function PartnerProfile() {
  const router = useRouter()
  const params = useParams()
  const partnerId = params.id as string

  const [partner, setPartner] = useState<Partner | null>(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)

  useEffect(() => {
    const fetchPartner = async () => {
      try {
        const response = await partnersAPI.getById(partnerId)
        setPartner(response.data)
      } catch (error) {
        console.error("Error fetching partner:", error)
      } finally {
        setLoading(false)
      }
    }

    if (partnerId) {
      fetchPartner()
    }
  }, [partnerId])

  const handleStatusUpdate = async (newStatus: string) => {
    if (!partner) return

    setUpdating(true)
    try {
      await partnersAPI.updateStatus(partner._id, newStatus)
      setPartner({ ...partner, status: newStatus as DELIVERY_PARTNER_STATUS})
    } catch (error) {
      console.error("Error updating partner status:", error)
    } finally {
      setUpdating(false)
    }
  }

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex-1 p-8 flex items-center justify-center">
          <p>Loading partner details...</p>
        </div>
      </AdminLayout>
    )
  }

  if (!partner) {
    return (
      <AdminLayout>
        <div className="flex-1 p-8 flex items-center justify-center">
          <div className="text-center">
            <p className="text-lg text-gray-600 mb-4">Partner not found</p>
            <Button onClick={() => router.push("/admin/dashboard")}>
              Back to Dashboard
            </Button>
          </div>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <h2 className="text-3xl font-bold tracking-tight">Partner Profile</h2>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {/* Partner Info Card */}
          <Card className="md:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  Partner Details
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => router.push(`/admin/partners/${partner._id}/update`)}
                    className="ml-2"
                  >
                    Update
                  </Button>
                    <Button
                    variant="destructive"
                    size="sm"
                    onClick={async () => {
                      await partnersAPI.deletePartner(partner._id)
                      router.push("/admin/dashboard")
                    }}
                    className="ml-2"
                    >
                    Remove
                    </Button>
                </div>
                <Badge className={getStatusColor(partner.status)}>
                  {partner.status.charAt(0).toUpperCase() + partner.status.slice(1)}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold text-lg">{partner.name}</h3>
                <p className="text-sm text-gray-600">ID: #{partner._id}</p>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-gray-500" />
                  <span className="text-sm">{partner.phone}</span>
                </div>

                {partner.email && (
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-gray-500" />
                    <span className="text-sm">{partner.email}</span>
                  </div>
                )}

                {/* {partner.address && (
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-gray-500" />
                    <span className="text-sm">{partner.address}</span>
                  </div>
                )} */}

                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <span className="text-sm">
                    Joined {new Date(partner.createdAt).toLocaleDateString()}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <Truck className="h-4 w-4 text-gray-500" />
                  <span className="text-sm">
                    {partner.assignedOrders || 0} Active Orders
                  </span>
                </div>
              </div>

              <div className="pt-4 border-t">
                <h4 className="font-medium mb-3">Update Status</h4>
                <div className="grid grid-cols-2 gap-2">
                  {Object.values(DELIVERY_PARTNER_STATUS).map((status) => (
                    <Button
                      key={status}
                      variant={partner.status === status ? "default" : "outline"}
                      size="sm"
                      disabled={updating || partner.status === status}
                      onClick={() => handleStatusUpdate(status)}
                      className="text-xs"
                    >
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </Button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Main Content */}
          <Card className="md:col-span-2">
            <CardContent className="p-6">
              <Tabs defaultValue="activity">
                <TabsList>
                  <TabsTrigger value="activity">Activity</TabsTrigger>
                  <TabsTrigger value="orders">Order History</TabsTrigger>
                  <TabsTrigger value="performance">Performance</TabsTrigger>
                </TabsList>

                <TabsContent value="activity" className="mt-6">
                  <div className="space-y-4">
                    <h3 className="font-semibold">Recent Activity</h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="text-sm font-medium">Status updated to {partner.status}</p>
                          <p className="text-xs text-gray-500">
                            {new Date(partner.updatedAt).toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <div className="text-center text-gray-500 text-sm py-8">
                        More activity details will be available when order history is implemented
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="orders" className="mt-6">
                  <div className="space-y-4">
                    <h3 className="font-semibold">Order History</h3>
                    <div className="text-center text-gray-500 text-sm py-8">
                      Order history will be displayed here when order management is implemented
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="performance" className="mt-6">
                  <div className="space-y-4">
                    <h3 className="font-semibold">Performance Metrics</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center p-4 bg-gray-50 rounded-lg">
                        <p className="text-2xl font-bold text-green-600">
                          {partner.assignedOrders || 0}
                        </p>
                        <p className="text-sm text-gray-600">Total Orders</p>
                      </div>
                      <div className="text-center p-4 bg-gray-50 rounded-lg">
                        <p className="text-2xl font-bold text-blue-600">-</p>
                        <p className="text-sm text-gray-600">Completed</p>
                      </div>
                      <div className="text-center p-4 bg-gray-50 rounded-lg">
                        <p className="text-2xl font-bold text-yellow-600">-</p>
                        <p className="text-sm text-gray-600">Rating</p>
                      </div>
                      <div className="text-center p-4 bg-gray-50 rounded-lg">
                        <p className="text-2xl font-bold text-purple-600">-</p>
                        <p className="text-sm text-gray-600">On Time %</p>
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  )
}
