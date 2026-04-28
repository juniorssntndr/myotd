import type { Brand, Category, Product, ProductVariant } from "@/types"

const now = new Date().toISOString()

const brandLogoBase = "https://cdn.jsdelivr.net/npm/simple-icons@v13/icons"

export const categories: Category[] = [
  { id: "cat-polos", name: "Polos", slug: "polos", icon: "Shirt", productCount: 6 },
  { id: "cat-hoodies", name: "Hoodies", slug: "hoodies", icon: "CloudRain", productCount: 4 },
  { id: "cat-zapatillas", name: "Zapatillas", slug: "zapatillas", icon: "Footprints", productCount: 5 },
  { id: "cat-accesorios", name: "Accesorios", slug: "accesorios", icon: "Watch", productCount: 2 },
  { id: "cat-conjuntos", name: "Conjuntos", slug: "conjuntos", icon: "Layers", productCount: 1 },
]

export const brands: Brand[] = [
  {
    id: "brand-nike",
    name: "Nike",
    slug: "nike",
    logo: `${brandLogoBase}/nike.svg`,
    productCount: 3,
  },
  {
    id: "brand-adidas",
    name: "Adidas",
    slug: "adidas",
    logo: `${brandLogoBase}/adidas.svg`,
    productCount: 3,
  },
  {
    id: "brand-converse",
    name: "Converse",
    slug: "converse",
    logo: "/brands/converse-wordmark.svg",
    productCount: 3,
  },
  {
    id: "brand-zara",
    name: "Zara",
    slug: "zara",
    logo: `${brandLogoBase}/zara.svg`,
    productCount: 3,
  },
  {
    id: "brand-new-balance",
    name: "New Balance",
    slug: "new-balance",
    logo: `${brandLogoBase}/newbalance.svg`,
    productCount: 3,
  },
  {
    id: "brand-puma",
    name: "Puma",
    slug: "puma",
    logo: `${brandLogoBase}/puma.svg`,
    productCount: 3,
  },
]

const categoryBySlug = new Map(categories.map((category) => [category.slug, category]))
const brandByName = new Map(brands.map((brand) => [brand.name, brand]))

function slugSegment(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
}

function createVariants(
  baseId: string,
  baseSku: string,
  sizes: string[],
  colors: string[]
): ProductVariant[] {
  return colors.flatMap((color, colorIndex) =>
    sizes.map((size, sizeIndex) => ({
      id: `${baseId}-${slugSegment(color)}-${slugSegment(size)}`,
      sku: `${baseSku}-${slugSegment(color).toUpperCase()}-${slugSegment(size).toUpperCase()}`,
      size,
      color,
      stock: Math.max(2, 18 - sizeIndex * 2 - colorIndex * 3),
    }))
  )
}

type ProductSeedInput = Omit<Product, "brandId" | "categoryId" | "createdAt" | "updatedAt"> & {
  category: string
  brand: string
}

function createProduct(input: ProductSeedInput): Product {
  const category = categoryBySlug.get(input.category)
  const brand = brandByName.get(input.brand)

  if (!category || !brand) {
    throw new Error(`Missing brand or category mapping for product ${input.slug}`)
  }

  return {
    ...input,
    categoryId: category.id,
    brandId: brand.id,
    createdAt: now,
    updatedAt: now,
  }
}

const apparelSizes = ["S", "M", "L", "XL"]
const hoodieSizes = ["S", "M", "L", "XL"]
const shoeSizes = ["38", "39", "40", "41", "42", "43"]

export const products: Product[] = [
  createProduct({
    id: "tee-nike-club-essential",
    name: "Nike Club Essential Tee",
    slug: "nike-club-essential-tee",
    brand: "Nike",
    category: "polos",
    price: 129.9,
    originalPrice: 159.9,
    images: [
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=900&h=900&fit=crop",
      "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?w=900&h=900&fit=crop",
    ],
    shortDescription: "Remera unisex de algodón pesado con logo minimal al frente.",
    description:
      "Remera Nike de silueta relaxed, pensada para uso diario y layering urbano. Algodón de buen gramaje, caída limpia y branding sutil para un look deportivo sin exagerar.",
    variants: createVariants("tee-nike-club-essential", "NK-TEE-CLUB", apparelSizes, ["Negro", "Blanco"]),
    sizes: apparelSizes,
    colors: ["Negro", "Blanco"],
    isNew: true,
    isFeatured: true,
    isActive: true,
    rating: 4.8,
  }),
  createProduct({
    id: "hoodie-nike-tech-fleece",
    name: "Nike Tech Fleece Hoodie",
    slug: "nike-tech-fleece-hoodie",
    brand: "Nike",
    category: "hoodies",
    price: 329.9,
    originalPrice: 389.9,
    images: [
      "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=900&h=900&fit=crop",
      "https://images.unsplash.com/photo-1611312449408-f6ce9bdb8e56?w=900&h=900&fit=crop",
    ],
    shortDescription: "Hoodie técnico unisex con estructura limpia y abrigo liviano.",
    description:
      "Una pieza clave para el clima de media estación. Capucha estructurada, cierre frontal y fit urbano. Ideal para combinar con joggers, denim o zapatillas chunky.",
    variants: createVariants("hoodie-nike-tech-fleece", "NK-HDY-TECH", hoodieSizes, ["Gris", "Negro"]),
    sizes: hoodieSizes,
    colors: ["Gris", "Negro"],
    isNew: false,
    isFeatured: true,
    isActive: true,
    rating: 4.9,
  }),
  createProduct({
    id: "shoe-nike-p6000",
    name: "Nike P-6000",
    slug: "nike-p-6000",
    brand: "Nike",
    category: "zapatillas",
    price: 469.9,
    originalPrice: 529.9,
    images: [
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=900&h=900&fit=crop",
      "https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=900&h=900&fit=crop",
    ],
    shortDescription: "Zapatilla retro runner con mezcla de malla y capas sintéticas.",
    description:
      "Inspirada en runners de archivo, la P-6000 entra perfecto en un catálogo urbano/deportivo. Volumen visual, comodidad diaria y look potente para outfits unisex.",
    variants: createVariants("shoe-nike-p6000", "NK-SHOE-P6K", shoeSizes, ["Plateado", "Negro"]),
    sizes: shoeSizes,
    colors: ["Plateado", "Negro"],
    isNew: true,
    isFeatured: true,
    isActive: true,
    rating: 4.9,
  }),

  createProduct({
    id: "tee-adidas-adicolor",
    name: "Adidas Adicolor Essentials Tee",
    slug: "adidas-adicolor-essentials-tee",
    brand: "Adidas",
    category: "polos",
    price: 119.9,
    originalPrice: 149.9,
    images: [
      "https://images.unsplash.com/photo-1503341504253-dff4815485f1?w=900&h=900&fit=crop",
      "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=900&h=900&fit=crop",
    ],
    shortDescription: "Remera unisex con logo Trefoil y fit clásico actualizado.",
    description:
      "Una base confiable para rotación diaria. Tejido suave, hombro relajado y branding limpio. Funciona con denim, joggers o shorts deportivos.",
    variants: createVariants("tee-adidas-adicolor", "AD-TEE-ADC", apparelSizes, ["Blanco", "Negro"]),
    sizes: apparelSizes,
    colors: ["Blanco", "Negro"],
    isNew: false,
    isFeatured: false,
    isActive: true,
    rating: 4.7,
  }),
  createProduct({
    id: "hoodie-adidas-essentials",
    name: "Adidas Essentials Fleece Hoodie",
    slug: "adidas-essentials-fleece-hoodie",
    brand: "Adidas",
    category: "hoodies",
    price: 299.9,
    images: [
      "https://images.unsplash.com/photo-1578681994506-b8f463449011?w=900&h=900&fit=crop",
      "https://images.unsplash.com/photo-1578681994506-b8f463449011?w=900&h=900&fit=crop",
    ],
    shortDescription: "Buzo con capucha, interior suave y look deportivo clásico.",
    description:
      "El tipo de hoodie que un reseller oficial sí tendría: simple, usable y con identidad fuerte. Va perfecto para un styling unisex de inspiración street.",
    variants: createVariants("hoodie-adidas-essentials", "AD-HDY-ESS", hoodieSizes, ["Negro", "Beige"]),
    sizes: hoodieSizes,
    colors: ["Negro", "Beige"],
    isNew: true,
    isFeatured: false,
    isActive: true,
    rating: 4.8,
  }),
  createProduct({
    id: "shoe-adidas-campus-00s",
    name: "Adidas Campus 00s",
    slug: "adidas-campus-00s",
    brand: "Adidas",
    category: "zapatillas",
    price: 429.9,
    originalPrice: 489.9,
    images: [
      "https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?w=900&h=900&fit=crop",
      "https://images.unsplash.com/photo-1560769629-975ec94e6a86?w=900&h=900&fit=crop",
    ],
    shortDescription: "Silhueta skate retro con presencia fuerte y suela de goma.",
    description:
      "Una zapatilla que conversa perfecto con el universo urbano. Perfil ancho, gamuza visualmente rica y una vibra Y2K muy buscada para looks unisex.",
    variants: createVariants("shoe-adidas-campus-00s", "AD-SHOE-CAMPUS", shoeSizes, ["Gris", "Negro"]),
    sizes: shoeSizes,
    colors: ["Gris", "Negro"],
    isNew: false,
    isFeatured: true,
    isActive: true,
    rating: 4.8,
  }),

  createProduct({
    id: "tee-converse-star-chevron",
    name: "Converse Star Chevron Tee",
    slug: "converse-star-chevron-tee",
    brand: "Converse",
    category: "polos",
    price: 109.9,
    images: [
      "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=900&h=900&fit=crop",
      "https://images.unsplash.com/photo-1622445275469-696fa103c4e9?w=900&h=900&fit=crop",
    ],
    shortDescription: "Remera gráfica unisex con identidad Converse y look relajado.",
    description:
      "Una tee versátil para rotación diaria, con estética college/street. Fit relajado, algodón suave y branding frontal que no compite con el outfit.",
    variants: createVariants("tee-converse-star-chevron", "CV-TEE-SC", apparelSizes, ["Blanco", "Negro"]),
    sizes: apparelSizes,
    colors: ["Blanco", "Negro"],
    isNew: false,
    isFeatured: false,
    isActive: true,
    rating: 4.6,
  }),
  createProduct({
    id: "shoe-converse-chuck-70-hi",
    name: "Converse Chuck 70 Hi",
    slug: "converse-chuck-70-hi",
    brand: "Converse",
    category: "zapatillas",
    price: 389.9,
    images: [
      "https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?w=900&h=900&fit=crop",
      "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=900&h=900&fit=crop",
    ],
    shortDescription: "Clásico high-top de lona con perfil icónico y styling atemporal.",
    description:
      "El producto perfecto para anclar la parte más urbana del catálogo. Combina con denim, joggers o piezas más limpias tipo Zara sin perder identidad.",
    variants: createVariants("shoe-converse-chuck-70-hi", "CV-SHOE-CH70", shoeSizes, ["Negro", "Crudo"]),
    sizes: shoeSizes,
    colors: ["Negro", "Crudo"],
    isNew: true,
    isFeatured: true,
    isActive: true,
    rating: 4.9,
  }),
  createProduct({
    id: "accessory-converse-utility-backpack",
    name: "Converse Utility Backpack",
    slug: "converse-utility-backpack",
    brand: "Converse",
    category: "accesorios",
    price: 219.9,
    images: [
      "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=900&h=900&fit=crop",
      "https://images.unsplash.com/photo-1622560480605-d83c853bc5c3?w=900&h=900&fit=crop",
    ],
    shortDescription: "Mochila urbana unisex con compartimento tech y estética limpia.",
    description:
      "Ideal para ciudad, estudio o trabajo ligero. Capacidad cómoda, diseño discreto y look funcional que acompaña la propuesta urbana del catálogo.",
    variants: createVariants("accessory-converse-utility-backpack", "CV-BAG-UTILITY", ["One Size"], ["Negro", "Arena"]),
    sizes: ["One Size"],
    colors: ["Negro", "Arena"],
    isNew: false,
    isFeatured: false,
    isActive: true,
    rating: 4.6,
  }),

  createProduct({
    id: "tee-zara-boxy-heavy",
    name: "Zara Boxy Heavy Tee",
    slug: "zara-boxy-heavy-tee",
    brand: "Zara",
    category: "polos",
    price: 99.9,
    images: [
      "https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=900&h=900&fit=crop",
      "https://images.unsplash.com/photo-1622445275576-721325763afe?w=900&h=900&fit=crop",
    ],
    shortDescription: "Remera boxy unisex de algodón pesado y look limpio.",
    description:
      "La cara lifestyle del mix de marcas. Silueta amplia, caída estructurada y paleta neutra para acompañar sneakers, denim o piezas deportivas.",
    variants: createVariants("tee-zara-boxy-heavy", "ZR-TEE-BOXY", apparelSizes, ["Crudo", "Negro"]),
    sizes: apparelSizes,
    colors: ["Crudo", "Negro"],
    isNew: true,
    isFeatured: false,
    isActive: true,
    rating: 4.5,
  }),
  createProduct({
    id: "hoodie-zara-minimal-zip",
    name: "Zara Minimal Zip Hoodie",
    slug: "zara-minimal-zip-hoodie",
    brand: "Zara",
    category: "hoodies",
    price: 249.9,
    images: [
      "https://images.unsplash.com/photo-1603796846097-bee99e4a601f?w=900&h=900&fit=crop",
      "https://images.unsplash.com/photo-1611312449408-f6ce9bdb8e56?w=900&h=900&fit=crop",
    ],
    shortDescription: "Hoodie con cierre y líneas limpias para looks urbanos sobrios.",
    description:
      "Una prenda puente entre deporte y lifestyle. Más limpia visualmente, pero perfectamente integrable en un universo reseller urbano con foco unisex.",
    variants: createVariants("hoodie-zara-minimal-zip", "ZR-HDY-ZIP", hoodieSizes, ["Piedra", "Negro"]),
    sizes: hoodieSizes,
    colors: ["Piedra", "Negro"],
    isNew: false,
    isFeatured: false,
    isActive: true,
    rating: 4.4,
  }),
  createProduct({
    id: "accessory-zara-nylon-crossbody",
    name: "Zara Nylon Crossbody Bag",
    slug: "zara-nylon-crossbody-bag",
    brand: "Zara",
    category: "accesorios",
    price: 159.9,
    images: [
      "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=900&h=900&fit=crop",
      "https://images.unsplash.com/photo-1572460557107-feca83eb3bc7?w=900&h=900&fit=crop",
    ],
    shortDescription: "Crossbody compacta de nylon con estética funcional y minimal.",
    description:
      "Accesorio unisex pensado para ciudad. Ligera, práctica y fácil de combinar con outfits sport-casual o streetwear limpio.",
    variants: createVariants("accessory-zara-nylon-crossbody", "ZR-BAG-CROSS", ["One Size"], ["Negro", "Oliva"]),
    sizes: ["One Size"],
    colors: ["Negro", "Oliva"],
    isNew: true,
    isFeatured: true,
    isActive: true,
    rating: 4.4,
  }),

  createProduct({
    id: "tee-new-balance-athletics",
    name: "New Balance Athletics Tee",
    slug: "new-balance-athletics-tee",
    brand: "New Balance",
    category: "polos",
    price: 119.9,
    images: [
      "https://images.unsplash.com/photo-1618354691438-25bc04584c23?w=900&h=900&fit=crop",
      "https://images.unsplash.com/photo-1583743811166-3f5c40f96a31?w=900&h=900&fit=crop",
    ],
    shortDescription: "Remera de inspiración running con look relajado para diario.",
    description:
      "La propuesta de New Balance funciona muy bien cuando mezcla deporte con lifestyle. Esta tee unisex va en esa línea: usable, limpia y contemporánea.",
    variants: createVariants("tee-new-balance-athletics", "NB-TEE-ATH", apparelSizes, ["Gris", "Blanco"]),
    sizes: apparelSizes,
    colors: ["Gris", "Blanco"],
    isNew: false,
    isFeatured: false,
    isActive: true,
    rating: 4.6,
  }),
  createProduct({
    id: "shoe-new-balance-530",
    name: "New Balance 530",
    slug: "new-balance-530",
    brand: "New Balance",
    category: "zapatillas",
    price: 449.9,
    originalPrice: 499.9,
    images: [
      "https://images.unsplash.com/photo-1595341888016-a392ef81b7de?w=900&h=900&fit=crop",
      "https://images.unsplash.com/photo-1600185365926-3a2ce3cdb9eb?w=900&h=900&fit=crop",
    ],
    shortDescription: "Runner retro con ADN técnico y mucha salida urbana.",
    description:
      "Un best seller natural para este universo visual. Malla, overlays y una estética runner que hoy se lleva con denim ancho, joggers o prendas minimalistas.",
    variants: createVariants("shoe-new-balance-530", "NB-SHOE-530", shoeSizes, ["Blanco", "Plata"]),
    sizes: shoeSizes,
    colors: ["Blanco", "Plata"],
    isNew: true,
    isFeatured: true,
    isActive: true,
    rating: 4.9,
  }),
  createProduct({
    id: "set-new-balance-athletics",
    name: "New Balance Athletics Set",
    slug: "new-balance-athletics-set",
    brand: "New Balance",
    category: "conjuntos",
    price: 359.9,
    images: [
      "https://images.unsplash.com/photo-1509631179647-0177331693ae?w=900&h=900&fit=crop",
      "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=900&h=900&fit=crop",
    ],
    shortDescription: "Conjunto unisex de sudadera y jogger para rutina urbana o viaje.",
    description:
      "Set completo con comodidad alta y lectura deportiva premium. Ideal para travel looks, fines de semana o uniformes urbanos relajados.",
    variants: createVariants("set-new-balance-athletics", "NB-SET-ATH", hoodieSizes, ["Gris", "Navy"]),
    sizes: hoodieSizes,
    colors: ["Gris", "Navy"],
    isNew: false,
    isFeatured: true,
    isActive: true,
    rating: 4.7,
  }),

  createProduct({
    id: "tee-puma-essentials-logo",
    name: "Puma Essentials Logo Tee",
    slug: "puma-essentials-logo-tee",
    brand: "Puma",
    category: "polos",
    price: 109.9,
    images: [
      "https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=900&h=900&fit=crop",
      "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=900&h=900&fit=crop",
    ],
    shortDescription: "Remera unisex de base deportiva con branding visible y limpio.",
    description:
      "Una tee muy fácil de vender en un contexto multimarca reseller: look deportivo, branding reconocible y silueta amplia que encaja con la estética urbana actual.",
    variants: createVariants("tee-puma-essentials-logo", "PM-TEE-ESS", apparelSizes, ["Blanco", "Negro"]),
    sizes: apparelSizes,
    colors: ["Blanco", "Negro"],
    isNew: false,
    isFeatured: false,
    isActive: true,
    rating: 4.5,
  }),
  createProduct({
    id: "hoodie-puma-better-classics",
    name: "Puma Better Classics Hoodie",
    slug: "puma-better-classics-hoodie",
    brand: "Puma",
    category: "hoodies",
    price: 279.9,
    images: [
      "https://images.unsplash.com/photo-1617137968427-85924c800a22?w=900&h=900&fit=crop",
      "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=900&h=900&fit=crop",
    ],
    shortDescription: "Hoodie de algodón con estética relajada y fit unisex.",
    description:
      "Pensado para un look sport-street sin esfuerzo. Volumen cómodo, buena base de color y branding Puma discreto para usarlo todo el año.",
    variants: createVariants("hoodie-puma-better-classics", "PM-HDY-CLASSIC", hoodieSizes, ["Arena", "Negro"]),
    sizes: hoodieSizes,
    colors: ["Arena", "Negro"],
    isNew: true,
    isFeatured: false,
    isActive: true,
    rating: 4.6,
  }),
  createProduct({
    id: "shoe-puma-suede-xl",
    name: "Puma Suede XL",
    slug: "puma-suede-xl",
    brand: "Puma",
    category: "zapatillas",
    price: 399.9,
    images: [
      "https://images.unsplash.com/photo-1539185441755-769473a23570?w=900&h=900&fit=crop",
      "https://images.unsplash.com/photo-1543508282-6319a3e2621f?w=900&h=900&fit=crop",
    ],
    shortDescription: "Sneaker de gamuza con perfil ancho y vibra skate/Y2K.",
    description:
      "Una silueta muy alineada con el streetwear actual. Suede, volumen generoso y mucha presencia visual para rematar outfits unisex de inspiración noventera.",
    variants: createVariants("shoe-puma-suede-xl", "PM-SHOE-SXL", shoeSizes, ["Azul Marino", "Negro"]),
    sizes: shoeSizes,
    colors: ["Azul Marino", "Negro"],
    isNew: true,
    isFeatured: true,
    isActive: true,
    rating: 4.8,
  }),
]

export const featuredProducts = products.filter((product) => product.isFeatured)
export const newProducts = products.filter((product) => product.isNew)
