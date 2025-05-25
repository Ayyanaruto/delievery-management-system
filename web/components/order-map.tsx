"use client"

import type { Order } from "@/types/order"
import L from "leaflet"
import "leaflet/dist/leaflet.css"
import { useEffect, useState } from "react"
import { MapContainer, Marker, Polyline, Popup, TileLayer } from "react-leaflet"

delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
})

const pickupIcon = new L.Icon({
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  className: "pickup-marker"
})

const deliveryIcon = new L.Icon({
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  className: "delivery-marker"
})

interface OrderMapProps {
  pickupAddress?: string
  deliveryAddress?: string
  pickupCoords?: {
    type: string
    coordinates: [number, number]
  }
  deliveryCoords?: {
    type: string
    coordinates: [number, number]
  }
  // For multiple orders (partner dashboard)
  orders?: Order[]
}

export default function OrderMap({
  pickupAddress,
  deliveryAddress,
  pickupCoords,
  deliveryCoords,
  orders
}: OrderMapProps) {
  const [coordinates, setCoordinates] = useState<{
    pickup: { lat: number; lng: number } | null
    delivery: { lat: number; lng: number } | null
    orderMarkers: Array<{
      id: string
      pickup: { lat: number; lng: number } | null
      delivery: { lat: number; lng: number } | null
      customer: string
      status: string
    }>
  }>({
    pickup: null,
    delivery: null,
    orderMarkers: []
  })

  const [center, setCenter] = useState<[number, number]>([28.6139, 77.2090])

  // Geocoding function to convert addresses to coordinates
  const geocodeAddress = async (address: string): Promise<{ lat: number; lng: number } | null> => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1`
      )
      const data = await response.json()

      if (data && data.length > 0) {
        return {
          lat: parseFloat(data[0].lat),
          lng: parseFloat(data[0].lon)
        }
      }
      return null
    } catch (error) {
      console.error("Geocoding error:", error)
      return null
    }
  }

  const convertGeoJSONToLatLng = (coords: { coordinates: [number, number] }): { lat: number; lng: number } => {
    return {
      lat: coords.coordinates[1],
      lng: coords.coordinates[0]
    }
  }

  useEffect(() => {
    const fetchCoordinates = async () => {
      if (!orders && pickupAddress && deliveryAddress) {
        let pickup: { lat: number; lng: number } | null = null
        let delivery: { lat: number; lng: number } | null = null

        if (pickupCoords && pickupCoords.coordinates && pickupCoords.coordinates.length === 2) {
          pickup = convertGeoJSONToLatLng(pickupCoords)
        } else {
          pickup = await geocodeAddress(pickupAddress)
        }

        if (deliveryCoords && deliveryCoords.coordinates && deliveryCoords.coordinates.length === 2) {
          delivery = convertGeoJSONToLatLng(deliveryCoords)
        } else {
          delivery = await geocodeAddress(deliveryAddress)
        }

        setCoordinates({ pickup, delivery, orderMarkers: [] })

        // Set center to midpoint of pickup and delivery, or first available location
        if (pickup && delivery) {
          const centerLat = (pickup.lat + delivery.lat) / 2
          const centerLng = (pickup.lng + delivery.lng) / 2
          setCenter([centerLat, centerLng])
        } else if (pickup) {
          setCenter([pickup.lat, pickup.lng])
        } else if (delivery) {
          setCenter([delivery.lat, delivery.lng])
        }
      }
      else if (orders && orders.length > 0) {
        const orderMarkers = await Promise.all(
          orders.map(async (order) => {
            let pickup: { lat: number; lng: number } | null = null
            let delivery: { lat: number; lng: number } | null = null

            if (order.pickupAddressCord &&
                order.pickupAddressCord.coordinates &&
                Array.isArray(order.pickupAddressCord.coordinates) &&
                order.pickupAddressCord.coordinates.length === 2) {
              pickup = convertGeoJSONToLatLng(order.pickupAddressCord)
            } else if (order.pickupAddress) {
              pickup = await geocodeAddress(order.pickupAddress)
            }

            if (order.deliveryAddressCord &&
                order.deliveryAddressCord.coordinates &&
                Array.isArray(order.deliveryAddressCord.coordinates) &&
                order.deliveryAddressCord.coordinates.length === 2) {
              delivery = convertGeoJSONToLatLng(order.deliveryAddressCord)
            } else if (order.deliveryAddress) {
              delivery = await geocodeAddress(order.deliveryAddress)
            }

            return {
              id: order._id || order.id || "",
              pickup,
              delivery,
              customer: order.customer,
              status: order.status || "assigned"
            }
          })
        )

        setCoordinates({ pickup: null, delivery: null, orderMarkers })

        const allCoords = orderMarkers.flatMap(marker =>
          [marker.pickup, marker.delivery].filter(Boolean)
        )

        if (allCoords.length > 0) {
          const avgLat = allCoords.reduce((sum, coord) => sum + coord!.lat, 0) / allCoords.length
          const avgLng = allCoords.reduce((sum, coord) => sum + coord!.lng, 0) / allCoords.length
          setCenter([avgLat, avgLng])
        }
      }
    }

    fetchCoordinates()
  }, [pickupAddress, deliveryAddress, pickupCoords, deliveryCoords, orders])

  if (!coordinates.pickup && !coordinates.delivery && coordinates.orderMarkers.length === 0) {
    return (
      <div className="h-64 bg-gray-100 rounded-md flex items-center justify-center">
        <p className="text-gray-500">Unable to load map locations</p>
      </div>
    )
  }

  return (
    <div className="h-64 w-full rounded-md overflow-hidden">
      <MapContainer
        center={center}
        zoom={12}
        style={{ height: "100%", width: "100%" }}
        className="rounded-md"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {coordinates.pickup && (
          <Marker position={[coordinates.pickup.lat, coordinates.pickup.lng]} icon={pickupIcon}>
            <Popup>
              <div>
                <strong>Pickup Location</strong>
                <br />
                {pickupAddress}
              </div>
            </Popup>
          </Marker>
        )}

        {coordinates.delivery && (
          <Marker position={[coordinates.delivery.lat, coordinates.delivery.lng]} icon={deliveryIcon}>
            <Popup>
              <div>
                <strong>Delivery Location</strong>
                <br />
                {deliveryAddress}
              </div>
            </Popup>
          </Marker>
        )}

        {coordinates.pickup && coordinates.delivery && (
          <Polyline
            positions={[
              [coordinates.pickup.lat, coordinates.pickup.lng],
              [coordinates.delivery.lat, coordinates.delivery.lng]
            ]}
            color="blue"
            weight={3}
            opacity={0.7}
          />
        )}

        {coordinates.orderMarkers.map((orderMarker) => (
          <div key={orderMarker.id}>
            {orderMarker.pickup && (
              <Marker position={[orderMarker.pickup.lat, orderMarker.pickup.lng]} icon={pickupIcon}>
                <Popup>
                  <div>
                    <strong>Pickup for {orderMarker.customer}</strong>
                    <br />
                    <span className="text-xs">Status: {orderMarker.status}</span>
                  </div>
                </Popup>
              </Marker>
            )}

            {orderMarker.delivery && (
              <Marker position={[orderMarker.delivery.lat, orderMarker.delivery.lng]} icon={deliveryIcon}>
                <Popup>
                  <div>
                    <strong>Delivery for {orderMarker.customer}</strong>
                    <br />
                    <span className="text-xs">Status: {orderMarker.status}</span>
                  </div>
                </Popup>
              </Marker>
            )}

            {orderMarker.pickup && orderMarker.delivery && (
              <Polyline
                positions={[
                  [orderMarker.pickup.lat, orderMarker.pickup.lng],
                  [orderMarker.delivery.lat, orderMarker.delivery.lng]
                ]}
                color={orderMarker.status === "assigned" ? "orange" : "blue"}
                weight={2}
                opacity={0.6}
              />
            )}
          </div>
        ))}
      </MapContainer>

      <style jsx global>{`
        .pickup-marker {
          filter: hue-rotate(120deg);
        }
        .delivery-marker {
          filter: hue-rotate(240deg);
        }
      `}</style>
    </div>
  )
}
