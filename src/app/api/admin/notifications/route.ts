import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAdmin } from "@/lib/api-auth"
import { displayVariantSize } from "@/lib/product-options"

interface NotificationItem {
  id: string
  title: string
  time: string
  date: Date
}

function getRelativeTime(date: Date): string {
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / (1000 * 60))
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffMins < 1) return "Hace un momento"
  if (diffMins < 60) return `Hace ${diffMins} minutos`
  if (diffHours < 24) return `Hace ${diffHours} ${diffHours === 1 ? "hora" : "horas"}`
  return `Hace ${diffDays} día${diffDays > 1 ? "s" : ""}`
}

export async function GET() {
  try {
    const adminCheck = await requireAdmin()
    if (adminCheck.response) {
      return adminCheck.response
    }

    const [recentOrders, recentUsers, lowStockVariants] = await Promise.all([
      // 1. Get latest 10 orders
      prisma.order.findMany({
        orderBy: { createdAt: "desc" },
        take: 10,
        select: {
          orderNumber: true,
          total: true,
          createdAt: true,
        },
      }),
      // 2. Get latest 10 users
      prisma.user.findMany({
        where: { role: "CUSTOMER" },
        orderBy: { createdAt: "desc" },
        take: 10,
        select: {
          id: true,
          name: true,
          email: true,
          createdAt: true,
        },
      }),
      // 3. Get variants with stock <= 5
      prisma.productVariant.findMany({
        where: { stock: { lte: 5 } },
        include: {
          product: {
            select: { name: true },
          },
        },
        orderBy: { stock: "asc" },
        take: 10,
      }),
    ])

    const notifications: NotificationItem[] = []

    // Compile orders
    recentOrders.forEach((order) => {
      notifications.push({
        id: `order-${order.orderNumber}`,
        title: `Nuevo pedido ${order.orderNumber}`,
        time: getRelativeTime(order.createdAt),
        date: order.createdAt,
      })
    })

    // Compile users
    recentUsers.forEach((user) => {
      notifications.push({
        id: `user-${user.id}`,
        title: `Nuevo usuario registrado: ${user.name}`,
        time: getRelativeTime(user.createdAt),
        date: user.createdAt,
      })
    })

    // Compile low stock variants
    lowStockVariants.forEach((variant) => {
      const variantSize = displayVariantSize(variant.size)
      const variantLabel = [variantSize, variant.color].filter(Boolean).join(" / ")

      notifications.push({
        id: `stock-${variant.id}`,
        title: `Stock bajo: ${variant.product.name}${variantLabel ? ` (${variantLabel})` : ""}`,
        time: `Solo quedan ${variant.stock} unidades`,
        // Default to a date, if we don't have update history we can use current date minus some hours or static date
        date: new Date(), 
      })
    })

    // Sort by date descending
    notifications.sort((a, b) => b.date.getTime() - a.date.getTime())

    // Take top 15 notifications
    const result = notifications.slice(0, 15).map(({ id, title, time }) => ({
      id,
      title,
      time,
    }))

    return NextResponse.json(result)
  } catch (error) {
    console.error("Error generating admin notifications:", error)
    return NextResponse.json(
      { error: "Error generating notifications" },
      { status: 500 }
    )
  }
}
