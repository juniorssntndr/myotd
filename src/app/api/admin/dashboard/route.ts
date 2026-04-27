import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAdmin } from "@/lib/api-auth"
import type {
  CriticalProduct,
  DashboardHistoryPoint,
  DashboardKpiMetric,
  DashboardRange,
  DashboardResponse,
} from "@/types/admin-dashboard"

const RANGE_IN_DAYS: Record<DashboardRange, number> = {
  "7d": 7,
  "30d": 30,
  "90d": 90,
}

const LOW_STOCK_THRESHOLD = 5

function normalizeRange(range: string | null): DashboardRange {
  if (range === "7d" || range === "30d" || range === "90d") {
    return range
  }

  return "30d"
}

function startOfDay(date: Date) {
  const copy = new Date(date)
  copy.setHours(0, 0, 0, 0)
  return copy
}

function addDays(date: Date, amount: number) {
  const copy = new Date(date)
  copy.setDate(copy.getDate() + amount)
  return copy
}

function calculateChange(current: number, previous: number) {
  if (previous === 0) {
    return current > 0 ? 100 : 0
  }

  return Number((((current - previous) / previous) * 100).toFixed(1))
}

function buildMetric(current: number, previous: number): DashboardKpiMetric {
  return {
    value: Number(current.toFixed(2)),
    previousValue: Number(previous.toFixed(2)),
    change: calculateChange(current, previous),
  }
}

function getDateKey(date: Date) {
  return startOfDay(date).toISOString().slice(0, 10)
}

function buildHistory(days: number, currentStart: Date, orders: { createdAt: Date; total: number }[]) {
  const buckets = new Map<string, DashboardHistoryPoint>()
  const labelFormatter = new Intl.DateTimeFormat("es-PE", {
    day: "2-digit",
    month: "short",
  })

  for (let index = 0; index < days; index += 1) {
    const date = addDays(currentStart, index)
    const key = getDateKey(date)
    buckets.set(key, {
      date: key,
      label: labelFormatter.format(date),
      revenue: 0,
      orders: 0,
    })
  }

  for (const order of orders) {
    const key = getDateKey(order.createdAt)
    const bucket = buckets.get(key)

    if (!bucket) continue

    bucket.revenue += order.total
    bucket.orders += 1
  }

  return Array.from(buckets.values()).map((point) => ({
    ...point,
    revenue: Number(point.revenue.toFixed(2)),
  }))
}

export async function GET(request: Request) {
  try {
    const { response } = await requireAdmin()
    if (response) {
      return response
    }

    const { searchParams } = new URL(request.url)
    const range = normalizeRange(searchParams.get("range"))
    const days = RANGE_IN_DAYS[range]
    const currentStart = addDays(startOfDay(new Date()), -(days - 1))
    const currentEnd = addDays(startOfDay(new Date()), 1)
    const previousStart = addDays(currentStart, -days)

    const [
      totalProducts,
      totalCustomers,
      totalOrders,
      revenueData,
      categoriesCount,
      recentOrders,
      ordersByStatus,
      activeProducts,
      inventoryProducts,
      ordersInWindow,
      customersInWindow,
    ] = await Promise.all([
      prisma.product.count(),
      prisma.user.count({
        where: { role: "CUSTOMER" },
      }),
      prisma.order.count(),
      prisma.order.aggregate({
        _sum: { total: true },
      }),
      prisma.category.count(),
      prisma.order.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        include: {
          user: {
            select: { name: true, email: true },
          },
        },
      }),
      prisma.order.findMany({
        select: {
          status: true,
        },
      }),
      prisma.product.count({
        where: { isActive: true },
      }),
      prisma.product.findMany({
        select: {
          id: true,
          name: true,
          category: {
            select: { name: true },
          },
          variants: {
            select: { stock: true },
          },
        },
      }),
      prisma.order.findMany({
        where: {
          createdAt: {
            gte: previousStart,
            lt: currentEnd,
          },
        },
        orderBy: { createdAt: "asc" },
        select: {
          id: true,
          userId: true,
          total: true,
          status: true,
          createdAt: true,
        },
      }),
      prisma.user.findMany({
        where: {
          role: "CUSTOMER",
          createdAt: {
            gte: previousStart,
            lt: currentEnd,
          },
        },
        select: {
          id: true,
          createdAt: true,
        },
      }),
    ])

    const statusCounts = ordersByStatus.reduce(
      (acc: Record<string, number>, item: { status: string }) => {
        const key = item.status.toLowerCase()
        acc[key] = (acc[key] || 0) + 1
        return acc
      },
      {} as Record<string, number>
    )

    const transformedRecentOrders = recentOrders.map((order: typeof recentOrders[number]) => ({
      id: order.id,
      orderNumber: order.orderNumber,
      customer: order.user.name,
      email: order.user.email,
      total: Number(order.total),
      status: order.status.toLowerCase(),
      createdAt: order.createdAt.toISOString(),
    }))

    const normalizedOrders = ordersInWindow.map((order) => ({
      ...order,
      total: Number(order.total),
      status: order.status.toLowerCase(),
    }))

    const currentOrders = normalizedOrders.filter((order) => order.createdAt >= currentStart)
    const previousOrders = normalizedOrders.filter((order) => order.createdAt < currentStart)

    const currentRevenue = currentOrders.reduce((sum, order) => sum + order.total, 0)
    const previousRevenue = previousOrders.reduce((sum, order) => sum + order.total, 0)
    const currentCustomers = customersInWindow.filter((customer) => customer.createdAt >= currentStart).length
    const previousCustomers = customersInWindow.filter((customer) => customer.createdAt < currentStart).length
    const currentAverageOrderValue = currentOrders.length > 0 ? currentRevenue / currentOrders.length : 0
    const previousAverageOrderValue = previousOrders.length > 0 ? previousRevenue / previousOrders.length : 0
    const history = buildHistory(days, currentStart, currentOrders)
    const currentNonCancelledOrders = currentOrders.filter((order) => order.status !== "cancelled")
    const deliveredOrders = currentOrders.filter((order) => order.status === "delivered").length

    const inventorySummary = inventoryProducts
      .map((product) => {
        const totalStock = product.variants.reduce((sum, variant) => sum + variant.stock, 0)
        return {
          id: product.id,
          name: product.name,
          category: product.category.name,
          stock: totalStock,
        }
      })
      .sort((a, b) => a.stock - b.stock)

    const outOfStockProducts = inventorySummary.filter((product) => product.stock === 0).length
    const lowStockProducts = inventorySummary.filter(
      (product) => product.stock > 0 && product.stock <= LOW_STOCK_THRESHOLD
    ).length
    const criticalProducts: CriticalProduct[] = inventorySummary
      .filter((product) => product.stock <= LOW_STOCK_THRESHOLD)
      .slice(0, 4)
      .map((product) => ({
        id: product.id,
        name: product.name,
        category: product.category,
        stock: product.stock,
        status: product.stock === 0 ? "out" : "low",
      }))

    const responseData: DashboardResponse = {
      range,
      stats: {
        totalProducts,
        totalCustomers,
        totalOrders,
        totalRevenue: Number(revenueData._sum.total || 0),
        categoriesCount,
      },
      commercial: {
        revenue: buildMetric(currentRevenue, previousRevenue),
        orders: buildMetric(currentOrders.length, previousOrders.length),
        customers: buildMetric(currentCustomers, previousCustomers),
        averageOrderValue: buildMetric(currentAverageOrderValue, previousAverageOrderValue),
      },
      history,
      ordersByStatus: {
        pending: statusCounts.pending || 0,
        confirmed: statusCounts.confirmed || 0,
        processing: statusCounts.processing || 0,
        shipped: statusCounts.shipped || 0,
        delivered: statusCounts.delivered || 0,
        cancelled: statusCounts.cancelled || 0,
      },
      operations: {
        activeProducts,
        outOfStockProducts,
        lowStockProducts,
        fulfillmentRate:
          currentNonCancelledOrders.length > 0
            ? Math.round((deliveredOrders / currentNonCancelledOrders.length) * 100)
            : 0,
        openOrders:
          (statusCounts.pending || 0) +
          (statusCounts.confirmed || 0) +
          (statusCounts.processing || 0) +
          (statusCounts.shipped || 0),
        criticalProducts,
      },
      recentOrders: transformedRecentOrders,
    }

    return NextResponse.json(responseData)
  } catch (error) {
    console.error("Error fetching dashboard stats:", error)
    return NextResponse.json(
      { error: "Error fetching dashboard stats" },
      { status: 500 }
    )
  }
}
