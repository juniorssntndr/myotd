# Plan: BasicTechShop - Ecommerce de Productos de Computación

## Configuración del Proyecto
- **Nombre**: BasicTechShop
- **Tema**: Claro + Oscuro (con toggle)
- **Páginas**: Completo (Home, Catálogo, Detalle, Carrito, Checkout)

## Stack Tecnológico
- **Frontend**: Next.js 14 (App Router)
- **Base de datos**: PostgreSQL (fase posterior)
- **ORM**: Prisma (fase posterior)
- **UI Components**: shadcn/ui
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Theme**: next-themes (para dark/light mode)

---

## Fase 1: Setup Inicial

### 1.1 Comandos de Inicialización
```bash
npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir
npx shadcn@latest init
npm install next-themes lucide-react
```

### 1.2 Componentes shadcn Requeridos
```bash
npx shadcn@latest add button card input badge slider checkbox select sheet separator avatar dropdown-menu breadcrumb scroll-area skeleton dialog tabs radio-group label
```

---

## Fase 2: Estructura de Carpetas

```
src/
├── app/
│   ├── layout.tsx              # Layout principal + ThemeProvider
│   ├── page.tsx                # Homepage
│   ├── products/
│   │   ├── page.tsx            # Catálogo de productos
│   │   └── [id]/
│   │       └── page.tsx        # Detalle de producto
│   ├── cart/
│   │   └── page.tsx            # Página del carrito
│   ├── checkout/
│   │   └── page.tsx            # Página de checkout
│   └── globals.css
├── components/
│   ├── layout/
│   │   ├── Header.tsx          # Navbar principal
│   │   ├── Footer.tsx          # Footer
│   │   ├── MobileNav.tsx       # Navegación móvil (Sheet)
│   │   ├── TopBar.tsx          # Barra superior
│   │   └── ThemeToggle.tsx     # Toggle dark/light mode
│   ├── home/
│   │   ├── HeroBanner.tsx      # Banner principal
│   │   ├── CategoryGrid.tsx    # Grid de categorías
│   │   └── FeaturedProducts.tsx
│   ├── products/
│   │   ├── ProductCard.tsx     # Tarjeta de producto
│   │   ├── ProductGrid.tsx     # Grid de productos
│   │   ├── ProductDetail.tsx   # Vista detalle
│   │   ├── ProductGallery.tsx  # Galería de imágenes
│   │   ├── FilterSidebar.tsx   # Sidebar de filtros
│   │   ├── FilterMobile.tsx    # Filtros móvil (Sheet)
│   │   ├── BrandFilter.tsx     # Filtro por marca
│   │   ├── PriceFilter.tsx     # Filtro por precio (slider)
│   │   ├── CategoryFilter.tsx  # Filtro por categoría
│   │   └── SortSelect.tsx      # Ordenamiento
│   ├── cart/
│   │   ├── CartIcon.tsx        # Icono con badge
│   │   ├── CartItem.tsx        # Item en carrito
│   │   ├── CartSummary.tsx     # Resumen del carrito
│   │   └── CartSheet.tsx       # Mini-cart en Sheet
│   ├── checkout/
│   │   ├── CheckoutForm.tsx    # Formulario de datos
│   │   ├── ShippingForm.tsx    # Datos de envío
│   │   ├── PaymentForm.tsx     # Selección de pago (UI)
│   │   └── OrderSummary.tsx    # Resumen del pedido
│   ├── providers/
│   │   └── ThemeProvider.tsx   # Provider de tema
│   └── ui/                     # Componentes shadcn
├── lib/
│   └── utils.ts
├── data/
│   └── mock-products.ts        # Datos mock
└── types/
    └── index.ts                # Tipos TypeScript
```

---

## Fase 3: Páginas y Componentes

### 3.1 Layout Principal (`layout.tsx`)
- ThemeProvider para dark/light mode
- TopBar (info envío, devoluciones)
- Header (logo, búsqueda, carrito, usuario, theme toggle)
- Footer

### 3.2 Homepage (`page.tsx`)
- HeroBanner con imagen tech y CTA
- CategoryGrid (iconos de categorías)
- FeaturedProducts (productos destacados)
- Sección de marcas

### 3.3 Catálogo de Productos (`/products`)
- Breadcrumbs + contador de resultados
- FilterSidebar (desktop) / FilterMobile (móvil)
  - Filtro por marca (checkboxes)
  - Filtro por precio (range slider)
  - Filtro por categoría
- ProductGrid con ProductCards
- SortSelect (Popular, Precio, Nuevo)
- Toggle vista grid/lista

### 3.4 Detalle de Producto (`/products/[id]`)
- ProductGallery (imagen principal + thumbnails)
- Info: nombre, marca, precio, descripción
- Selector de cantidad
- Botón "Agregar al carrito"
- Especificaciones técnicas
- Productos relacionados

### 3.5 Carrito (`/cart`)
- Lista de CartItems
- Cantidad editable
- Botón eliminar
- CartSummary (subtotal, envío, total)
- Botón "Proceder al checkout"

### 3.6 Checkout (`/checkout`)
- Stepper: Datos > Envío > Pago > Confirmación
- ShippingForm (nombre, dirección, teléfono)
- PaymentForm (selección método - solo UI)
- OrderSummary
- Botón "Confirmar pedido"

---

## Fase 4: Sistema de Temas

### Configuración next-themes
```tsx
// ThemeProvider.tsx
<ThemeProvider attribute="class" defaultTheme="system" enableSystem>
```

### Variables CSS (globals.css)
```css
/* Tema Claro */
:root {
  --background: 0 0% 100%;
  --foreground: 222.2 84% 4.9%;
  --primary: 199 89% 48%;        /* Sky blue */
  --accent: 142 71% 45%;         /* Green */
}

/* Tema Oscuro */
.dark {
  --background: 222.2 84% 4.9%;
  --foreground: 210 40% 98%;
  --primary: 199 89% 48%;
  --accent: 142 71% 45%;
}
```

---

## Fase 5: Datos Mock

### Tipos TypeScript
```typescript
interface Product {
  id: string
  name: string
  slug: string
  brand: string
  category: string
  price: number
  originalPrice?: number
  images: string[]
  description: string
  specs: Record<string, string>
  stock: number
  isNew: boolean
  isFeatured: boolean
  rating: number
}

interface Category {
  id: string
  name: string
  slug: string
  icon: string
  productCount: number
}

interface CartItem {
  product: Product
  quantity: number
}
```

### Categorías
- Computadoras/PCs
- Monitores
- Teclados
- Mouse
- Audífonos
- Almacenamiento
- Componentes (GPU, RAM, etc.)

### Marcas
ASUS, MSI, Corsair, Logitech, Razer, HyperX, Kingston, Samsung, LG, Dell, NVIDIA, AMD

---

## Fase 6: Orden de Implementación

### Paso 1: Setup Base
1. Inicializar Next.js con TypeScript y Tailwind
2. Instalar shadcn/ui y configurar
3. Instalar next-themes y lucide-react
4. Configurar ThemeProvider

### Paso 2: Layout y Navegación
5. TopBar
6. Header con logo, búsqueda, iconos
7. ThemeToggle
8. MobileNav (Sheet)
9. Footer

### Paso 3: Homepage
10. HeroBanner
11. CategoryGrid
12. FeaturedProducts
13. Datos mock de productos

### Paso 4: Catálogo de Productos
14. ProductCard
15. ProductGrid
16. FilterSidebar (Brand, Price, Category)
17. FilterMobile
18. SortSelect
19. Página /products completa

### Paso 5: Detalle de Producto
20. ProductGallery
21. ProductDetail
22. Productos relacionados
23. Página /products/[id]

### Paso 6: Carrito
24. CartIcon con badge
25. CartSheet (mini-cart)
26. CartItem
27. CartSummary
28. Página /cart

### Paso 7: Checkout
29. CheckoutForm
30. ShippingForm
31. PaymentForm (UI)
32. OrderSummary
33. Página /checkout

### Paso 8: Polish Final
34. Loading states (Skeletons)
35. Estados hover y animaciones
36. Responsive final
37. Accesibilidad básica

---

## Archivos Críticos a Crear

| Archivo | Descripción |
|---------|-------------|
| `src/app/layout.tsx` | Layout raíz con providers |
| `src/app/page.tsx` | Homepage |
| `src/app/products/page.tsx` | Catálogo |
| `src/app/products/[id]/page.tsx` | Detalle producto |
| `src/app/cart/page.tsx` | Carrito |
| `src/app/checkout/page.tsx` | Checkout |
| `src/components/layout/Header.tsx` | Header principal |
| `src/components/products/ProductCard.tsx` | Card de producto |
| `src/components/products/FilterSidebar.tsx` | Filtros |
| `src/data/mock-products.ts` | Datos mock |
| `src/types/index.ts` | Tipos TS |

---

## Notas

- **Solo UI**: Este plan es exclusivamente frontend
- **Sin backend**: No se crearán APIs ni conexión a DB en esta fase
- **Datos mock**: Se usarán datos estáticos
- **Prisma/PostgreSQL**: Se implementará después de completar la UI
- **Imágenes**: Se usarán placeholders o imágenes de Unsplash
