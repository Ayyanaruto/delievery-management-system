"use client"
import AdminLayout from "@/components/admin-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { ordersAPI } from "@/lib/api"
import type { Order } from "@/types/order"
import { ArrowLeft, Plus, X } from "lucide-react"
import { useParams, useRouter } from "next/navigation"
import { useEffect, useState } from "react"

export default function UpdateOrder() {
  const router = useRouter()
  const params = useParams()
  const orderId = params.id as string

  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    customer: "",
    customerPhone: "",
    pickupAddress: "",
    deliveryAddress: "",
    items: [""],
    status: "pending"
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        setLoading(true)
        const response = await ordersAPI.getById(orderId)

        if (!response.success || !response.data) {
          throw new Error("Order not found")
        }

        const orderData = response.data
        setOrder(orderData)
        setFormData({
          customer: orderData.customer || "",
          customerPhone: orderData.customerPhone || "",
          pickupAddress: orderData.pickupAddress || "",
          deliveryAddress: orderData.deliveryAddress || "",
          items: orderData.items && orderData.items.length > 0 ? orderData.items : [""],
          status: orderData.status || "pending"
        })
      } catch (error) {
        console.error("Error fetching order:", error)
        setErrors({ fetch: error instanceof Error ? error.message : "Failed to load order" })
      } finally {
        setLoading(false)
      }
    }

    if (orderId) {
      fetchOrder()
    }
  }, [orderId])

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.customer.trim()) {
      newErrors.customer = "Customer name is required"
    }

    if (!formData.customerPhone.trim()) {
      newErrors.customerPhone = "Customer phone is required"
    }

    if (!formData.pickupAddress.trim()) {
      newErrors.pickupAddress = "Pickup address is required"
    }

    if (!formData.deliveryAddress.trim()) {
      newErrors.deliveryAddress = "Delivery address is required"
    }

    const validItems = formData.items.filter(item => item.trim())
    if (validItems.length === 0) {
      newErrors.items = "At least one item is required"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setSubmitting(true)
    try {
      const updateData = {
        ...formData,
        items: formData.items.filter(item => item.trim())
      }

      const response = await ordersAPI.update(orderId, updateData)

      if (response.success) {
        router.push(`/admin/orders/${orderId}`)
      } else {
        throw new Error(response.message || "Failed to update order")
      }
    } catch (error) {
      console.error("Error updating order:", error)
      setErrors({ submit: error instanceof Error ? error.message : "Failed to update order. Please try again." })
    } finally {
      setSubmitting(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }))
    }
  }

  const handleItemChange = (index: number, value: string) => {
    const newItems = [...formData.items]
    newItems[index] = value
    setFormData(prev => ({ ...prev, items: newItems }))
    if (errors.items) {
      setErrors(prev => ({ ...prev, items: "" }))
    }
  }

  const addItem = () => {
    setFormData(prev => ({ ...prev, items: [...prev.items, ""] }))
  }

  const removeItem = (index: number) => {
    if (formData.items.length > 1) {
      const newItems = formData.items.filter((_, i) => i !== index)
      setFormData(prev => ({ ...prev, items: newItems }))
    }
  }

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex-1 p-8 flex items-center justify-center">
          <p>Loading order details...</p>
        </div>
      </AdminLayout>
    )
  }

  if (errors.fetch || !order) {
    return (
      <AdminLayout>
        <div className="flex-1 p-8 flex items-center justify-center">
          <div className="text-center">
            <p className="text-lg text-red-600 mb-4">{errors.fetch || "Order not found"}</p>
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
          <h2 className="text-3xl font-bold tracking-tight">Update Order</h2>
        </div>

        <div className="max-w-2xl">
          <Card>
            <CardHeader>
              <CardTitle>Order Information</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="customer">Customer Name</Label>
                  <Input
                    id="customer"
                    type="text"
                    value={formData.customer}
                    onChange={(e) => handleInputChange("customer", e.target.value)}
                    placeholder="Enter customer name"
                    className={errors.customer ? "border-red-500" : ""}
                  />
                  {errors.customer && (
                    <p className="text-sm text-red-500">{errors.customer}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="customerPhone">Customer Phone</Label>
                  <Input
                    id="customerPhone"
                    type="tel"
                    value={formData.customerPhone}
                    onChange={(e) => handleInputChange("customerPhone", e.target.value)}
                    placeholder="Enter customer phone"
                    className={errors.customerPhone ? "border-red-500" : ""}
                  />
                  {errors.customerPhone && (
                    <p className="text-sm text-red-500">{errors.customerPhone}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="pickupAddress">Pickup Address</Label>
                  <Textarea
                    id="pickupAddress"
                    value={formData.pickupAddress}
                    onChange={(e) => handleInputChange("pickupAddress", e.target.value)}
                    placeholder="Enter pickup address"
                    className={errors.pickupAddress ? "border-red-500" : ""}
                  />
                  {errors.pickupAddress && (
                    <p className="text-sm text-red-500">{errors.pickupAddress}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="deliveryAddress">Delivery Address</Label>
                  <Textarea
                    id="deliveryAddress"
                    value={formData.deliveryAddress}
                    onChange={(e) => handleInputChange("deliveryAddress", e.target.value)}
                    placeholder="Enter delivery address"
                    className={errors.deliveryAddress ? "border-red-500" : ""}
                  />
                  {errors.deliveryAddress && (
                    <p className="text-sm text-red-500">{errors.deliveryAddress}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Items</Label>
                  {formData.items.map((item, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        value={item}
                        onChange={(e) => handleItemChange(index, e.target.value)}
                        placeholder={`Item ${index + 1}`}
                        className="flex-1"
                      />
                      {formData.items.length > 1 && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => removeItem(index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addItem}
                    className="flex items-center gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    Add Item
                  </Button>
                  {errors.items && (
                    <p className="text-sm text-red-500">{errors.items}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select value={formData.status} onValueChange={(value) => handleInputChange("status", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="assigned">Assigned</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {errors.submit && (
                  <p className="text-sm text-red-500">{errors.submit}</p>
                )}

                <div className="flex gap-4 pt-4">
                  <Button
                    type="submit"
                    disabled={submitting}
                    className="flex-1"
                  >
                    {submitting ? "Updating..." : "Update Order"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.back()}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  )
}
