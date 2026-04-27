// ============================================================
// MYOTD — CONTRATOS CONGELADOS (v1.0)
// Fashion E-commerce — Stock por Variante (talla + color)
// ============================================================

// ---- Enums ----

export type OrderStatus =
  | "PENDING"
  | "CONFIRMED"
  | "PROCESSING"
  | "SHIPPED"
  | "DELIVERED"
  | "CANCELLED"

export type PaymentStatus = "PENDING" | "COMPLETED" | "FAILED" | "REFUNDED"

export type PaymentMethod = "CARD" | "WALLET" | "TRANSFER" | "CASH_ON_DELIVERY"

export type SortOption =
  | "popular"
  | "price-asc"
  | "price-desc"
  | "newest"
  | "rating"

// ---- Producto con Variantes ----

export interface ProductVariant {
  id: string
  sku: string
  size: string
  color: string
  stock: number
}

export interface Product {
  id: string
  name: string
  slug: string
  brand: string
  brandId: string
  category: string
  categoryId: string
  price: number
  originalPrice?: number
  images: string[]
  shortDescription: string
  description: string
  variants: ProductVariant[]
  sizes: string[]
  colors: string[]
  isNew: boolean
  isFeatured: boolean
  isActive: boolean
  rating: number
  createdAt: string
  updatedAt: string
}

// ---- Carrito con Variante ----

export interface CartItem {
  product: Product
  variantId: string
  quantity: number
}

// ---- Filtros extendidos para moda ----

export interface FilterState {
  categories: string[]
  brands: string[]
  sizes: string[]
  colors: string[]
  priceRange: [number, number]
  sortBy: SortOption
}

// ---- Categorías y Marcas ----

export interface Category {
  id: string
  name: string
  slug: string
  icon: string
  productCount: number
}

export interface Brand {
  id: string
  name: string
  slug: string
  logo?: string
  productCount: number
  isFavorite?: boolean
}

// ---- Órdenes ----

export interface OrderItem {
  id: string
  productId: string
  variantId: string
  name: string
  brand: string
  sku: string
  size: string
  color: string
  price: number
  quantity: number
  image: string
  total: number
}

export interface Order {
  id: string
  orderNumber: string
  userId: string
  status: OrderStatus
  subtotal: number
  shipping: number
  total: number
  paymentMethod: PaymentMethod
  paymentStatus: PaymentStatus
  culqiPaymentId?: string
  shippingAddress: ShippingAddress
  items: OrderItem[]
  notes?: string
  createdAt: string
  updatedAt: string
}

// ---- Envíos ----

export interface ShippingZone {
  id: string
  name: string
  districts: string[]
  baseCost: number
  freeShippingThreshold: number
}

export interface ShippingAddress {
  name: string
  phone: string
  address: string
  city: string
  district: string
  zipCode: string
}

// ---- Checkout ----

export interface CheckoutItem {
  productId: string
  variantId: string
  name: string
  brand: string
  size: string
  color: string
  price: number
  quantity: number
  image: string
}

export interface CheckoutBody {
  items: CheckoutItem[]
  shippingAddress: ShippingAddress
  paymentMethod: PaymentMethod
  notes?: string
}

// ---- API Response Types ----

export interface ProductsResponse {
  products: Product[]
  total: number
  page: number
  pageSize: number
}

export interface ProductFilters {
  category?: string
  brand?: string
  size?: string
  color?: string
  minPrice?: number
  maxPrice?: number
  sortBy?: SortOption
  isNew?: boolean
  isFeatured?: boolean
  search?: string
}

// ---- WhatsApp Context ----

export type WhatsAppContext =
  | { type: "product"; productId: string; productName: string }
  | { type: "cart" }
  | { type: "support" }
  | { type: "order"; orderId: string }
