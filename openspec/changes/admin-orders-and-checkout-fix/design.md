# Design: Admin Orders and Checkout Redirection Fix

## Technical Approach
We will fix the client-side checkout page race condition by reading cart items on mount only. We will add the "/admin/orders" section in admin navigation and implement the list and details pages.

## Architecture Decisions

### Decision: Mount-Only Cart Guard
**Choice**: Use `useCartStore.getState().items` inside `useEffect` with `[router]` dependencies.
**Alternatives considered**: Check `loading` state, or add artificial setTimeouts.
**Rationale**: Accessing the store value directly on mount avoids reactive state synchronization triggering redirects when cart is cleared during checkout.

### Decision: Dedicated Orders Detail Page
**Choice**: A dedicated Next.js page at `/admin/orders/[id]` instead of a modal dialog.
**Alternatives considered**: Sidebar Sheet or modal popup.
**Rationale**: Aligns with Project Rule #1 (no modals for data management/creation, dedicated pages instead) and provides ample layout space for logistics information.

## Data Flow
```
[Admin Orders UI] ──(fetchOrders)──→ [useAdminStore] ──(GET /api/admin/orders)──→ [Database]
[Admin Order Detail UI] ──(updateOrderStatus)──→ [PUT /api/orders/[id]] ──→ [Database & Variant Stock Adjust]
```

## File Changes

| File | Action | Description |
|------|--------|-------------|
| `src/app/(shop)/checkout/page.tsx` | Modify | Adjust empty-cart guard `useEffect` dependency to run only on mount. |
| `src/lib/admin-navigation.ts` | Modify | Register "Pedidos" route in the sidebar layout. |
| `src/app/(admin-panel)/admin/orders/page.tsx` | Create | Page showing order table, filtering, searching and pagination. |
| `src/app/(admin-panel)/admin/orders/[id]/page.tsx` | Create | Detail page showing items, shipping, payment info, and status update selector. |

## Interfaces / Contracts
Using existing schemas for Order, OrderItem, Address from Prisma client.

## Testing Strategy
- Manual testing of card payment success and verify correct redirection to `/checkout/success?order=...` without `/cart` redirect.
- Manual testing of admin portal: navigate to `/admin/orders`, verify list displays correctly, filtering and searching operates, click order to open details page, and update status. Verify stock updates in DB.

## Migration / Rollout
No database migration required.
