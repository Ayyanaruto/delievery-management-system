const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1"

// Helper function for making API requests
async function fetchAPI(endpoint: string, options: RequestInit = {}) {
  const token = localStorage.getItem("token")

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers ? Object.fromEntries(new Headers(options.headers).entries()) : {}),
  }

  if (token) {
    headers["Authorization"] = `Bearer ${token}`
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  })

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.message || "Something went wrong")
  }

  return data
}

export const authAPI = {
  login: async (email: string, password: string) => {
    return fetchAPI("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    })
  },

  register: async (userData: any) => {
    return fetchAPI("/auth/register", {
      method: "POST",
      body: JSON.stringify(userData),
    })
  },

  getCurrentUser: async () => {
    return fetchAPI("/auth/me")
  },
}
