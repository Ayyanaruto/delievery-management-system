"use client"

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

// Custom icons for pickup and delivery
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
  pickupAddress: string
  deliveryAddress: string
  pickupCoords?: {
    type: string
    coordinates: [number, number] // GeoJSON format: [lng, lat]
  }
  deliveryCoords?: {
    type: string
    coordinates: [number, number] // GeoJSON format: [lng, lat]
  }
}

export default function OrderMap({
  pickupAddress,
  deliveryAddress,
  pickupCoords,
  deliveryCoords
}: OrderMapProps) {
  const [coordinates, setCoordinates] = useState<{
    pickup: { lat: number; lng: number } | null
    delivery: { lat: number; lng: number } | null
  }>({
    pickup: null,
    delivery: null
  })

  const [center, setCenter] = useState<[number, number]>([28.6139, 77.2090]) // Default to Delhi

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

  // Helper function to convert GeoJSON coordinates to Leaflet format
  const convertGeoJSONToLatLng = (coords: { coordinates: [number, number] }): { lat: number; lng: number } => {
    // GeoJSON format is [longitude, latitude], Leaflet expects [latitude, longitude]
    return {
      lat: coords.coordinates[1],
      lng: coords.coordinates[0]
    }
  }

  useEffect(() => {
    const fetchCoordinates = async () => {
      let pickup: { lat: number; lng: number } | null = null
      let delivery: { lat: number; lng: number } | null = null

      // Convert GeoJSON coordinates if available, otherwise geocode
      if (pickupCoords && pickupCoords.coordinates && pickupCoords.coordinates.length === 2) {
        pickup = convertGeoJSONToLatLng(pickupCoords)
        console.log("Pickup coords converted:", pickup)
      } else {
        pickup = await geocodeAddress(pickupAddress)
        console.log("Pickup coords geocoded:", pickup)
      }

      if (deliveryCoords && deliveryCoords.coordinates && deliveryCoords.coordinates.length === 2) {
        delivery = convertGeoJSONToLatLng(deliveryCoords)
        console.log("Delivery coords converted:", delivery)
      } else {
        delivery = await geocodeAddress(deliveryAddress)
        console.log("Delivery coords geocoded:", delivery)
      }

      setCoordinates({ pickup, delivery })

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

    fetchCoordinates()
  }, [pickupAddress, deliveryAddress, pickupCoords, deliveryCoords])

  if (!coordinates.pickup && !coordinates.delivery) {
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
