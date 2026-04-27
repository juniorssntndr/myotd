import { create } from "zustand"
import type {
  DashboardCommercialMetrics,
  DashboardHistoryPoint,
  DashboardOperationalMetrics,
  DashboardRange,
  DashboardStatsOverview,
  OrdersByStatus,
  RecentOrder,
} from "@/types/admin-dashboard"

interface AdminOrder {
  id: string
  orderNumber: string
  customer: {
    name: string
    email: string
  }
  status: string
  subtotal: number
  shipping: number
  total: number
  paymentMethod: string
  shippingAddress: {
    name: string
    address: string
    city: string
    state: string
    zipCode: string
  }
  items: {
    name: string
    quantity: number
    price: number
    total: number
    image: string
  }[]
  itemCount: number
  createdAt: string
  updatedAt: string
}

interface AdminUser {
  id: string
  name: string
  email: string
  avatar?: string
  role: string
  status: string
  createdAt: string
  orders: number
  totalSpent: number
}

interface AdminState {
  // Dashboard
  dashboardRange: DashboardRange
  stats: DashboardStatsOverview | null
  commercial: DashboardCommercialMetrics | null
  history: DashboardHistoryPoint[]
  operations: DashboardOperationalMetrics | null
  ordersByStatus: OrdersByStatus | null
  recentOrders: RecentOrder[]

  // Orders
  orders: AdminOrder[]
  ordersTotal: number

  // Users
  users: AdminUser[]

  loading: boolean
  error: string | null

  // Actions
  fetchDashboard: (range?: DashboardRange) => Promise<void>
  fetchOrders: (params?: { status?: string; limit?: number; offset?: number }) => Promise<void>
  fetchUsers: (params?: { role?: string; status?: string }) => Promise<void>
  updateOrderStatus: (id: string, status: string) => Promise<void>
}

export const useAdminStore = create<AdminState>((set, get) => ({
  dashboardRange: "30d",
  stats: null,
  commercial: null,
  history: [],
  operations: null,
  ordersByStatus: null,
  recentOrders: [],
  orders: [],
  ordersTotal: 0,
  users: [],
  loading: false,
  error: null,

  fetchDashboard: async (range = "30d") => {
    set({ loading: true, error: null })
    try {
      const response = await fetch(`/api/admin/dashboard?range=${range}`)
      if (!response.ok) throw new Error("Error fetching dashboard")
      const data = await response.json()
      set({
        dashboardRange: data.range,
        stats: data.stats,
        commercial: data.commercial,
        history: data.history,
        operations: data.operations,
        ordersByStatus: data.ordersByStatus,
        recentOrders: data.recentOrders,
        loading: false,
      })
    } catch (error) {
      set({ error: (error as Error).message, loading: false })
    }
  },

  fetchOrders: async (params = {}) => {
    set({ loading: true, error: null })
    try {
      const searchParams = new URLSearchParams()
      if (params.status) searchParams.set("status", params.status)
      if (params.limit) searchParams.set("limit", params.limit.toString())
      if (params.offset) searchParams.set("offset", params.offset.toString())

      const response = await fetch(`/api/admin/orders?${searchParams}`)
      if (!response.ok) throw new Error("Error fetching orders")
      const data = await response.json()
      set({
        orders: data.orders,
        ordersTotal: data.total,
        loading: false,
      })
    } catch (error) {
      set({ error: (error as Error).message, loading: false })
    }
  },

  fetchUsers: async (params = {}) => {
    set({ loading: true, error: null })
    try {
      const searchParams = new URLSearchParams()
      if (params.role) searchParams.set("role", params.role)
      if (params.status) searchParams.set("status", params.status)

      const response = await fetch(`/api/users?${searchParams}`)
      if (!response.ok) throw new Error("Error fetching users")
      const users = await response.json()
      set({ users, loading: false })
    } catch (error) {
      set({ error: (error as Error).message, loading: false })
    }
  },

  updateOrderStatus: async (id, status) => {
    set({ loading: true, error: null })
    try {
      const response = await fetch(`/api/orders/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      })
      if (!response.ok) throw new Error("Error updating order")

      // Refresh orders after update
      await get().fetchOrders()
    } catch (error) {
      set({ error: (error as Error).message, loading: false })
      throw error
    }
  },
}))
