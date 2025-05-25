"use client"

import PartnerLayout from "@/components/partner-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "@/hooks/use-toast"
import { partnersAPI } from "@/lib/api"
import type { DELIVERY_PARTNER_STATUS, Partner } from "@/types/partner"
import { ArrowLeft, Save } from "lucide-react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

export default function PartnerProfile() {
  const router = useRouter()
  const [partner, setPartner] = useState<Partner | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    status: "" as string
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const fetchPartnerData = async () => {
      try {
        const userStr = localStorage.getItem("user")
        if (!userStr) {
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

        const response = await partnersAPI.getById(user.partnerId)
        if (response.success) {
          const partnerData = response.data

          setPartner(partnerData)
          setFormData({
            name: partnerData.name || "",
            email: partnerData.email || "",
            phone: partnerData.phone || "",
            status: partnerData.status || ""
          })
        } else {
          throw new Error(response.message || "Failed to fetch partner data")
        }
      } catch (error) {
        console.error("Error fetching partner data:", error)
        toast({
          title: "Error",
          description: "Failed to load profile data",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchPartnerData()
  }, [router])

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSave = async () => {
    if (!partner) return

    setSaving(true)
    try {
      const basicInfoChanged = formData.name !== partner.name ||
                              formData.email !== partner.email ||
                              formData.phone !== partner.phone

      if (basicInfoChanged) {
        const updateResponse = await partnersAPI.update(partner._id, {
          name: formData.name,
          email: formData.email,
          phone: formData.phone
        })

        if (!updateResponse.success) {
          throw new Error(updateResponse.message || "Failed to update profile")
        }
      }

      if (formData.status !== partner.status) {
        const statusResponse = await partnersAPI.updateStatus(partner._id, formData.status)

        if (!statusResponse.success) {
          throw new Error(statusResponse.message || "Failed to update status")
        }
      }

      setPartner(prev => prev ? {
        ...prev,
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        status: formData.status as DELIVERY_PARTNER_STATUS
      } : null)

      toast({
        title: "Profile updated",
        description: "Your profile has been successfully updated.",
      })
    } catch (error) {
      console.error("Error updating profile:", error)
      toast({
        title: "Update failed",
        description: error instanceof Error ? error.message : "Failed to update profile. Please try again.",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <PartnerLayout>
        <div className="flex-1 p-8 flex items-center justify-center">
          <p>Loading profile data...</p>
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
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
            </Button>
            <h2 className="text-3xl font-bold tracking-tight">Profile</h2>
          </div>
          <Button onClick={handleSave} disabled={saving}>
            <Save className="mr-2 h-4 w-4" />
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>Update your personal details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  placeholder="Enter your full name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  placeholder="Enter your email address"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => handleInputChange("phone", e.target.value)}
                  placeholder="Enter your phone number"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Availability Status</CardTitle>
              <CardDescription>Manage your availability for deliveries</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="status">Current Status</Label>
                <Select value={formData.status} onValueChange={(value) => handleInputChange("status", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select your status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="AVAILABLE">Available</SelectItem>
                    <SelectItem value="OFFLINE">Offline</SelectItem>
                    <SelectItem value="ON_BREAK">On Break</SelectItem>
                    <SelectItem value="ON_DELIVERY">On Delivery</SelectItem>
                    <SelectItem value="ASSIGNED">Assigned</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium mb-2">Status Meanings:</h4>
                <ul className="text-sm space-y-1 text-gray-600">
                  <li><strong>Available:</strong> Ready to receive new orders</li>
                  <li><strong>Offline:</strong> Not accepting any orders</li>
                  <li><strong>On Break:</strong> Temporarily unavailable</li>
                  <li><strong>On Delivery:</strong> Currently delivering an order</li>
                  <li><strong>Assigned:</strong> Order assigned but not started</li>
                </ul>
              </div>

              {partner && (
                <div className="pt-4 border-t">
                  <h4 className="font-medium mb-2">Account Information</h4>
                  <div className="space-y-1 text-sm text-gray-600">
                    <p><strong>Member since:</strong> {new Date(partner.createdAt).toLocaleDateString()}</p>
                    <p><strong>Total assigned orders:</strong> {partner.assignedOrders?.length || 0}</p>
                    <p><strong>Last updated:</strong> {new Date(partner.updatedAt).toLocaleDateString()}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </PartnerLayout>
  )
}
