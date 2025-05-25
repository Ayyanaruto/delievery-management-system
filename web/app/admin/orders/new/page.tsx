"use client"

import type React from "react"

import AdminLayout from "@/components/admin-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/hooks/use-toast"
import { ordersAPI } from "@/lib/api"
import { useRouter } from "next/navigation"
import { useState } from "react"

const PICKUP_ADDRESSES = {
  "rentkar-mumbai": {
    address: "303,304 Royal Enclave Parsi Panchayat Road, Old Nagardas Rd, Mumbai, Maharashtra 400069",
    lat: 19.125401,
    lng: 72.852493
  }
}

export default function NewOrderPage() {
  const router = useRouter()
  const [customerName, setCustomerName] = useState("")
  const [customerPhone, setCustomerPhone] = useState("")
  const [pickupAddressKey, setPickupAddressKey] = useState("")
  const [deliveryAddress, setDeliveryAddress] = useState("")
  const [items, setItems] = useState("")
  const [isLoading, setIsLoading] = useState(false)


  const getCoordinatesFromAddress = async (address: string) => {
    try {
      const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

      if (!apiKey) {
        throw new Error("Google Maps API key is not configured");
      }

      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${apiKey}`
      )
      const data = await response.json()
      console.log(data)

      if (data.status === "OK" && data.results && data.results.length > 0) {
        return {
          lat: data.results[0].geometry.location.lat,
          lng: data.results[0].geometry.location.lng
        }
      }

      if (data.status === "ZERO_RESULTS") {
        throw new Error("Address not found. Please check the address and try again.")
      }

      if (data.status === "REQUEST_DENIED") {
        throw new Error("Google Maps API request denied. Please check your API key.")
      }

      throw new Error(`Geocoding failed: ${data.status}`)
    } catch (error) {
      console.error("Geocoding error:", error)
      throw new Error("Failed to convert address to coordinates")
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      if (!pickupAddressKey) {
        throw new Error("Please select a pickup address")
      }

      const pickupData = PICKUP_ADDRESSES[pickupAddressKey as keyof typeof PICKUP_ADDRESSES]


      const deliveryCoords = await getCoordinatesFromAddress(deliveryAddress)

      const orderData = {
        customer: customerName,
        customerPhone,
        pickupAddress: pickupData.address,
        pickupAddressCord: {
          type: "Point",
          coordinates: [pickupData.lng, pickupData.lat]
        },
        deliveryAddress,
        deliveryAddressCord: {
          type: "Point",
          coordinates: [deliveryCoords.lng, deliveryCoords.lat]
        },
        items: items.split("\n").filter(item => item.trim() !== ""),
      }

      const response = await ordersAPI.create(orderData)

      toast({
        title: "Order created",
        description: `Order has been created successfully.`,
      })

      router.push("/admin/dashboard")
    } catch (error) {
      console.error("Create order error:", error)
      toast({
        title: "Failed to create order",
        description: error instanceof Error ? error.message : "There was a problem creating the order.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AdminLayout>
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold tracking-tight">Create New Order</h2>
        </div>

        <Card>
          <form onSubmit={handleSubmit}>
            <CardHeader>
              <CardTitle>Order Details</CardTitle>
              <CardDescription>Enter the details for the new delivery order</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="customerName">Customer Name</Label>
                <Input
                  id="customerName"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="customerPhone">Customer Phone</Label>
                <Input
                  id="customerPhone"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="pickupAddress">Pickup Address</Label>
                <Select value={pickupAddressKey} onValueChange={setPickupAddressKey} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select pickup address" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="rentkar-mumbai">
                      Rentkar Mumbai - 303,304 Royal Enclave Parsi Panchayat Road, Old Nagardas Rd, Mumbai, Maharashtra 400069
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="deliveryAddress">Delivery Address</Label>
                <Textarea
                  id="deliveryAddress"
                  value={deliveryAddress}
                  onChange={(e) => setDeliveryAddress(e.target.value)}
                  placeholder="Enter the complete delivery address..."
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="items">Items (one per line)</Label>
                <Textarea
                  id="items"
                  value={items}
                  onChange={(e) => setItems(e.target.value)}
                  placeholder="Laptop - 1 unit&#10;Headphones - 2 units"
                  required
                  rows={4}
                />
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button type="button" variant="outline" onClick={() => router.push("/admin/dashboard")}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Creating..." : "Create Order"}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </AdminLayout>
  )
}
