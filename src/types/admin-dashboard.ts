export type DashboardRange = "7d" | "30d" | "90d"

export interface DashboardStatsOverview {
  totalProducts: number
  totalCustomers: number
  totalOrders: number
  totalRevenue: number
  categoriesCount: number
}

export interface DashboardKpiMetric {
  value: number
  previousValue: number
  change: number
}

export interface DashboardCommercialMetrics {
  revenue: DashboardKpiMetric
  orders: DashboardKpiMetric
  customers: DashboardKpiMetric
  averageOrderValue: DashboardKpiMetric
}

export interface DashboardHistoryPoint {
  date: string
  label: string
  revenue: number
  orders: number
}

export interface OrdersByStatus {
  pending: number
  confirmed: number
  processing: number
  shipped: number
  delivered: number
  cancelled: number
}

export interface RecentOrder {
  id: string
  orderNumber: string
  customer: string
  email: string
  total: number
  status: string
  createdAt: string
}

export interface CriticalProduct {
  id: string
  name: string
  category: string
  stock: number
  status: "low" | "out"
}

export interface DashboardOperationalMetrics {
  activeProducts: number
  outOfStockProducts: number
  lowStockProducts: number
  fulfillmentRate: number
  openOrders: number
  criticalProducts: CriticalProduct[]
}

export interface DashboardResponse {
  range: DashboardRange
  stats: DashboardStatsOverview
  commercial: DashboardCommercialMetrics
  history: DashboardHistoryPoint[]
  ordersByStatus: OrdersByStatus
  operations: DashboardOperationalMetrics
  recentOrders: RecentOrder[]
}
