import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowRight, Package, Truck, Users } from "lucide-react"

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Rentkar Delivery</h1>
          <div className="flex gap-4">
            <Button asChild variant="outline">
              <Link href="/login">Login</Link>
            </Button>
            <Button asChild>
              <Link href="/register">Register</Link>
            </Button>
          </div>
        </div>
      </header>
      <main className="flex-1 container mx-auto px-4 py-12">
        <section className="mb-16 text-center">
          <h2 className="text-4xl font-bold mb-4">Delivery Management System</h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
            A streamlined solution for managing deliveries, assigning partners, and tracking orders in real-time.
          </p>
          <div className="flex justify-center gap-4">
            <Button asChild size="lg">
              <Link href="/login">
                Get Started <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </section>

        <section className="grid md:grid-cols-3 gap-8 mb-16">
          <Card>
            <CardHeader>
              <Package className="h-12 w-12 text-primary mb-2" />
              <CardTitle>Order Management</CardTitle>
              <CardDescription>Create and manage delivery orders with ease</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Admins can create new orders, track their status, and manage all delivery operations from a centralized
                dashboard.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Users className="h-12 w-12 text-primary mb-2" />
              <CardTitle>Partner Assignment</CardTitle>
              <CardDescription>Assign orders to available delivery partners</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Easily assign orders to the most suitable delivery partners based on location, availability, and
                workload.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Truck className="h-12 w-12 text-primary mb-2" />
              <CardTitle>Real-time Tracking</CardTitle>
              <CardDescription>Track deliveries on an interactive map</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Delivery partners can view their assigned orders on a map and update order status in real-time.
              </p>
            </CardContent>
          </Card>
        </section>
      </main>
      <footer className="bg-gray-100 py-8">
        <div className="container mx-auto px-4 text-center text-gray-600">
          <p>© 2024 Rentkar Delivery Management System</p>
        </div>
      </footer>
    </div>
  )
}
