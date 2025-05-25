import { Role } from "@/types/auth"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1"

async function fetchAPI(endpoint: string, options: RequestInit = {}) {
  const token = localStorage.getItem("token")

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers ? Object.fromEntries(new Headers(options.headers).entries()) : {}),
  }

  if (token) {
    headers["Authorization"] = `Bearer ${token}`
  }

  try {
    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers,
    })

    const contentType = response.headers.get("content-type")
    if (!contentType || !contentType.includes("application/json")) {
      throw new Error(`Server returned ${response.status}: ${response.statusText}`)
    }

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.message || `HTTP ${response.status}: ${response.statusText}`)
    }

    return data
  } catch (error) {
    if (error instanceof TypeError && error.message.includes("fetch")) {
      throw new Error("Unable to connect to server. Please check if the server is running.")
    }
    throw error
  }
}

export const authAPI = {
  login: async (email: string, password: string) => {
    return fetchAPI("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    })
  },

  register: async (userData: {name:string,email:string,password:string,phone:string,role:Role}) => {
    return fetchAPI("/auth/register", {
      method: "POST",
      body: JSON.stringify(userData),
    })
  },

  getCurrentUser: async () => {
    return fetchAPI("/auth/me")
  },
}

export const partnersAPI = {
  getAll: async (filters = {}) => {
    const queryParams = new URLSearchParams(filters as Record<string, string>).toString()
    return fetchAPI(`/partners${queryParams ? `?${queryParams}` : ''}`)
  },

  getById: async (id: string) => {
    return fetchAPI(`/partners/${id}`)
  },

  update: async (id: string, partnerData: unknown) => {
    return fetchAPI(`/partners/${id}`, {
      method: "PUT",
      body: JSON.stringify(partnerData),
    })
  },

  updateStatus: async (id: string, status: string) => {
    return fetchAPI(`/partners/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    })
  },
  deletePartner : async (id:string) => {
    return fetchAPI(`/partners/${id}`,{
      method:"DELETE",
    })
  }
}

export const ordersAPI = {
  getAll: async (filters = {}) => {
    const queryParams = new URLSearchParams(filters as Record<string, string>).toString()
    return fetchAPI(`/orders${queryParams ? `?${queryParams}` : ''}`)
  },

  getById: async (id: string) => {
    return fetchAPI(`/orders/${id}`)
  },

  create: async (orderData: any) => {
    return fetchAPI("/orders", {
      method: "POST",
      body: JSON.stringify(orderData),
    })
  },

  update: async (id: string, orderData: any) => {
    return fetchAPI(`/orders/${id}`, {
      method: "PUT",
      body: JSON.stringify(orderData),
    })
  },

  delete: async (id: string) => {
    return fetchAPI(`/orders/${id}`, {
      method: "DELETE",
    })
  },

  assign: async (id: string, partnerId: string) => {
    return fetchAPI(`/orders/${id}/assign`, {
      method: "POST",
      body: JSON.stringify({ partnerId }),
    })
  },

  unassign: async (id: string) => {
    return fetchAPI(`/orders/${id}/unassign`, {
      method: "POST",
    })
  },

  getPartnerOrders: async (partnerId: string) => {

    return fetchAPI(`/orders/partner/${partnerId}`)
  },

  updateStatus: async (id: string, status: string) => {
    return fetchAPI(`/orders/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    })
  },
}
