# Proposal: Admin Orders and Checkout Redirection Fix

## Intent
Fix checkout page redirection race condition and implement the admin orders management dashboard for logistics.

## Scope

### In Scope
- Fix empty-cart guard race condition on `/checkout` page.
- Add "Pedidos" (Orders) navigation link to Admin Sidebar.
- Implement `/admin/orders` page listing all orders with search (by order number, customer name, email) and status filters.
- Implement `/admin/orders/[id]` page displaying order items, shipping details, and status update form.

### Out of Scope
- Automated invoice PDF generation (deferred).
- Advanced automated warehouse routing integrations.

## Capabilities

### New Capabilities
- `admin-orders`: View list of orders, filter, search, view details, and update status.

### Modified Capabilities
- `checkout-success`: Successful checkout cleanly transitions to `/checkout/success` and clears cart.

## Approach
- Update `CheckoutPage` guard to read cart items only on mount to prevent race condition.
- Add the `orders` route configuration to `admin-navigation.ts`.
- Create `/admin/orders/page.tsx` utilizing `useAdminStore` to fetch and filter orders.
- Create `/admin/orders/[id]/page.tsx` to handle order status modification via `/api/orders/[id]` PUT handler.

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `src/app/(shop)/checkout/page.tsx` | Modified | Mount-only cart check to prevent race condition. |
| `src/lib/admin-navigation.ts` | Modified | Add Pedidos to operation sidebar links. |
| `src/app/(admin-panel)/admin/orders/page.tsx` | New | Admin orders list page. |
| `src/app/(admin-panel)/admin/orders/[id]/page.tsx` | New | Admin order details and status manager page. |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Unauthorized order modification | Low | Use `requireAdminPage()` wrapper in the layout/pages. |

## Rollback Plan
Revert git commits modifying the files and delete the new order page directories.

## Success Criteria
- [ ] Cart success redirect functions without getting stuck or redirecting to empty cart.
- [ ] Admin panel shows "Pedidos" in sidebar.
- [ ] Admin can view paginated list of orders, filter by status, search.
- [ ] Admin can select an order, view items/shipping, and change status (e.g. to SHIPPED).
