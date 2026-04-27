# PLAN: Myotd Production Alignment

## Objective
Leave the store production-ready for Myotd with real checkout contracts, variant-based inventory, and no Stripe legacy dependencies.

## Execution Blocks

### Block A - Data and Contracts
- Add Prisma migration for:
  - `ProductVariant`.
  - `OrderItem.variantId`.
  - `Order.culqiPaymentId`.
- Backfill legacy products into minimum valid variants.
- Update shared types (`CheckoutBody`, `OrderItem`, product variant contracts).
- Update seed to fashion domain (25-35 products).

### Block B - Backend
- Consolidate checkout to Culqi only.
- Make `/api/checkout` accept and validate:
  - `items[] { productId, variantId, name, brand, size, color, price, quantity, image }`
  - `shippingAddress`
  - `paymentMethod`
  - `notes?`
- Ensure `/api/checkout` returns:
  - `{ checkoutUrl, orderId, orderNumber }`
- Restore product CRUD (`POST/PUT/DELETE`) with variants and stock by combination.
- Ensure order APIs include `variantId`, `size`, `color`, `sku` per item.
- Keep webhook flow for confirmation, cancellation, and refund stock consistency.

### Block C - Frontend
- Connect checkout page to real cart state and real `/api/checkout` payload.
- Enforce variant-aware order summary and cart behavior.
- Remove Stripe wording/routes from public UX.
- Apply Myotd branding (logo + copy + payment/shipping messaging).

### Block D - Hardening
- `npm run lint` clean.
- `npx tsc --noEmit` clean.
- Quick regression pass across:
  - Home, catalog, PDP, cart, checkout.
  - Profile/orders.
  - Admin/products and admin/orders.
- Update base docs (`PRD`, `PLAN`, `PAGES`, `DATA-MODEL`).

## Current Baseline Checks
- Lint: clean.
- TypeScript: clean.

## Operational Notes
- Primary gateway: Culqi.
- Inventory source of truth: variant stock.
- Database strategy: migration + backfill (no destructive reset).
- Do not run `next build` during this execution.
