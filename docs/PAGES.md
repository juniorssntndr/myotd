# PAGES and API Map: Myotd

## Public Pages

| Route | Description | Auth |
|---|---|---|
| `/` | Home with urban brand identity and featured drops | No |
| `/products` | Catalog with filters (category, brand, size, color, price) | No |
| `/products/[id]` | Product detail with variant selection | No |
| `/cart` | Cart with variant-aware items | No |
| `/checkout` | 3-step checkout and Culqi redirect | Yes |
| `/login` | Login | Guest only |
| `/register` | Register | Guest only |

## Customer Account Pages

| Route | Description | Auth |
|---|---|---|
| `/profile` | Profile summary | Yes |
| `/profile/orders` | Order history | Yes |
| `/profile/addresses` | Address management | Yes |
| `/profile/addresses/new` | Create address | Yes |
| `/profile/addresses/[id]/edit` | Edit address | Yes |
| `/profile/favorites` | Favorites | Yes |
| `/profile/settings` | Account settings | Yes |

## Admin Pages

| Route | Description | Auth |
|---|---|---|
| `/admin` | Dashboard and KPIs | Admin |
| `/admin/products` | Product list and status | Admin |
| `/admin/products/new` | Create product with variants | Admin |
| `/admin/products/[id]/edit` | Edit product + variants | Admin |
| `/admin/users` | User management | Admin |
| `/admin/payments` | Payment monitoring | Admin |
| `/admin/settings` | Store settings | Admin |

## API Routes

### Auth
| Method | Route | Description |
|---|---|---|
| GET/POST | `/api/auth/[...nextauth]` | Session and auth handlers |
| POST | `/api/auth/register` | User registration |

### Catalog and Product Admin
| Method | Route | Description |
|---|---|---|
| GET | `/api/products` | List products with real filters |
| POST | `/api/products` | Create product with variants |
| GET | `/api/products/[id]` | Product by id/slug |
| PUT | `/api/products/[id]` | Update product and variants |
| DELETE | `/api/products/[id]` | Soft delete product (`isActive=false`) |
| GET | `/api/categories` | Category list |
| GET | `/api/brands` | Brand list |

### Checkout and Payments
| Method | Route | Description |
|---|---|---|
| POST | `/api/checkout` | Create order + Culqi checkout URL |
| POST | `/api/webhook/culqi` | Culqi payment webhook |
| POST | `/api/webhook/stripe` | Deprecated (410) |

### Orders
| Method | Route | Description |
|---|---|---|
| GET | `/api/orders` | Current user orders with variant data |
| POST | `/api/orders` | Create order record |
| GET | `/api/orders/[id]` | Order details with item variant fields |
| PUT | `/api/orders/[id]` | Update order status/notes |
| GET | `/api/admin/orders` | Admin order listing |

### User and Addresses
| Method | Route | Description |
|---|---|---|
| GET/POST | `/api/addresses` | User addresses |
| GET/PUT/DELETE | `/api/addresses/[id]` | Address detail/update/delete |
| GET/POST | `/api/users` | Admin users operations |
| GET | `/api/admin/dashboard` | Admin dashboard summary |
