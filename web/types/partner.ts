export interface Partner {
  _id: string
  name: string
  email: string
  phone: string
  status: DELIVERY_PARTNER_STATUS
  assignedOrders:string[]
  createdAt:Date
  updatedAt:Date
}

export interface CreatePartnerData {
  name: string
  email: string
  phone: string
  status?: DELIVERY_PARTNER_STATUS
}

export interface UpdatePartnerData {
  name?: string
  email?: string
  phone?: string
  status?: DELIVERY_PARTNER_STATUS
}

export enum DELIVERY_PARTNER_STATUS {
  AVAILABLE = "AVAILABLE",
  OFFLINE = "OFFLINE",
  ON_BREAK = "ON_BREAK",
  ON_DELIVERY = "ON_DELIVERY",
  ASSIGNED = "ASSIGNED"
}
