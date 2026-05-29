## Exploration: Admin Orders and Checkout Redirection Fix

### Current State
1. **Checkout Redirection**: When a checkout is processed, the cart is cleared. However, the checkout page has a reactive `useEffect` checking `items.length === 0`, which immediately triggers `router.replace("/cart")` before the router transition to `/checkout/success` can finish, causing a race condition where the user is left in `/cart` with an empty cart.
2. **Admin Orders**: The database has a fully defined `Order` model and `OrderStatus` enum. There are route handlers (`/api/admin/orders` for listing and `/api/orders/[id]` for updating). The Zustand `useAdminStore` has built-in fetch/update actions. However, there is no Orders panel link in `admin-navigation.ts`, and the page `/admin/orders` does not exist, causing a 404.

### Affected Areas
- `src/app/(shop)/checkout/page.tsx` — Modify the empty cart guard to run only on mount.
- `src/lib/admin-navigation.ts` — Add "Pedidos" link pointing to `/admin/orders` to the Operation section.
- `src/app/(admin-panel)/admin/orders/page.tsx` — [NEW] List all orders with filters (status, search) and pagination.
- `src/app/(admin-panel)/admin/orders/[id]/page.tsx` — [NEW] Detailed order view with status update capabilities (logistics management).

### Approaches
1. **Approach: Mount-only Cart Guard + Dedicated Admin Orders Sub-pages**
   - Pros: Simple, completely resolves the race condition, and respects Project Rule #1 (no modals for creating/managing data, dedicated pages instead).
   - Cons: Requires creating two new pages.
   - Effort: Medium

### Recommendation
Use Approach 1 as it aligns with the project architecture, resolves the race condition cleanly without adding artificial delays, and follows the React/Next.js router best practices.

### Risks
- **Route Authorization**: The orders page must be protected using `requireAdminPage()` or standard middleware to prevent unauthorized access.
- **Stock Double-Decrement**: Ensure status updates (like cancelling) decrement/increment stock correctly. Our PUT API already handles stock reversion on cancellation, which mitigates this risk.

### Ready for Proposal
Yes.
