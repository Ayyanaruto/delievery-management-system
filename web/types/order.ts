export enum OrderStatus {
  PENDING = "pending",
  ASSIGNED = "assigned",
  IN_PROGRESS = "in_progress",
  DELIVERED = "delivered",
  CANCELLED = "cancelled"
}

export interface Coordinates {
  type: "Point"
  coordinates: [number, number]
}

export interface Order {
  _id?: string
  id?: string
  customer: string
  customerPhone: string
  deliveryAddress: string
  pickupAddress: string
  pickupAddressCord: Coordinates
  deliveryAddressCord: Coordinates
  items: string[]
  status: OrderStatus
  assignedTo?: string | null
  createdAt: string | Date
  updatedAt: string | Date
}

export interface CreateOrderData {
  customer: string
  customerPhone: string
  deliveryAddress: string
  pickupAddress: string
  pickupAddressCord: Coordinates
  deliveryAddressCord: Coordinates
  items: string[]
}

export interface UpdateOrderData {
  customer?: string
  customerPhone?: string
  deliveryAddress?: string
  pickupAddress?: string
  pickupAddressCord?: Coordinates
  deliveryAddressCord?: Coordinates
  items?: string[]
  status?: OrderStatus
  assignedTo?: string | null
}

export interface OrderFilters {
  status?: OrderStatus | string
  assignedTo?: string
  customer?: string
  limit?: number
  skip?: number
}
