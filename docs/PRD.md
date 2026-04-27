# PRD: Myotd

## 1. Executive Summary
Myotd is a fashion e-commerce focused on urban and casual style for women and men in Peru.
The MVP combines recognized brands and accessible products, with direct web checkout and strong brand identity.

| Aspect | Detail |
|---|---|
| Business type | B2C fashion e-commerce |
| Launch market | Peru (national shipping) |
| Positioning | Urban multi-brand, accessible pricing |
| Product range at launch | 25 to 35 products |
| Current status | API + UI integrated with real checkout contract |

## 2. Core Business Goals
- Sell directly from the web with full cart and checkout flow.
- Build Myotd brand presence with a modern, minimal urban look (white + red).
- Keep product operations simple for launch: admin CRUD, variant stock, and order visibility.

## 3. Target Customer
- Age: 17 to 30.
- Profile: urban/casual style, mid-level spending.
- Priority products: polos, hoodies, sets, sneakers, accessories.

## 4. MVP Scope
### Public Store
- Home, product listing, product detail, cart, checkout.
- Filters: category, brand, size, color, price.
- Variant selection required (size + color) before add to cart.

### Checkout and Payment
- Main gateway: Culqi.
- Payment methods shown in UX: card, wallet (Yape/Plin), transfer.
- Checkout API contract uses explicit `productId + variantId` for every item.

### Orders and Stock
- Orders keep variant snapshot fields per item: `variantId`, `size`, `color`, `sku`.
- Stock is managed by variant, not product-level stock.
- Cancel/refund flows restore variant stock.

### Admin
- Product CRUD with variants (create, update, remove/disable behavior).
- Order monitoring with item-level variant data.
- Basic dashboard stats and operations baseline.

## 5. Non-Functional Requirements
- Responsive mobile-first UX.
- Stable lint and TypeScript baseline.
- No server actions for core flows; route handlers only.
- Global state with Zustand; forms with react-hook-form + zod.

## 6. Exclusions for this MVP
- Coupon engine.
- Advanced recommendation engine.
- Marketplace integrations.
- Multi-currency and multi-language.
