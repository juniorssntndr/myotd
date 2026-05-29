# Tasks: Admin Orders and Checkout Redirection Fix

## Phase 1: Checkout Redirection Fix
- [ ] 1.1 Modify empty-cart guard in `src/app/(shop)/checkout/page.tsx` to run only on initial page mount using `useCartStore.getState().items`.

## Phase 2: Navigation Integration
- [ ] 2.1 Register "Pedidos" route in `src/lib/admin-navigation.ts` under "Operación" group, mapping to `/admin/orders` with `CreditCard` or a dedicated icon.

## Phase 3: Admin Orders Pages
- [ ] 3.1 Create `/admin/orders/page.tsx` using `useAdminStore`'s `fetchOrders` action to load, filter, and paginate orders.
- [ ] 3.2 Create `/admin/orders/[id]/page.tsx` displaying full order detail, shipping address, notes, items list, and a status update dropdown calling `updateOrderStatus`.

## Phase 4: Verification
- [ ] 4.1 Verify successful card payment redirects cleanly to `/checkout/success?order=...` without route race condition.
- [ ] 4.2 Verify admin panel lists orders at `/admin/orders` and order details are editable at `/admin/orders/[id]`.
