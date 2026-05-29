## Exploration: Admin Notifications and Order Deletion

### Current State
1. **Notifications**: Currently, `useNotificationStore` uses hardcoded mock notifications. There is no backend endpoint to load real-time notifications about new users, new orders, or low stock products.
2. **Order Deletion**: The system does not support deleting orders. The `/api/orders/[id]` endpoint only supports `GET` and `PUT`. There is no `DELETE` endpoint, and the UI has no button/option to delete orders.

### Affected Areas
- `src/app/api/admin/notifications/route.ts` — [NEW] Route to query orders, users, and low stock variants, pre-formatting notification strings.
- `src/stores/notification-store.ts` — Modify store to fetch notifications, save `readIds` in localStorage, and filter out read notifications.
- `src/components/admin/AdminHeader.tsx` — Add `useEffect` to fetch notifications on load.
- `src/app/api/orders/[id]/route.ts` — Add `DELETE` route to delete orders and revert stock if order status is not CANCELLED.
- `src/stores/admin-store.ts` — Add `deleteOrder` action.
- `src/app/(admin-panel)/admin/orders/page.tsx` — Add "Eliminar" dropdown option and AlertDialog double-check confirmation.
- `src/app/(admin-panel)/admin/orders/[id]/page.tsx` — Add "Eliminar Pedido" button and AlertDialog double-check confirmation with router redirect.

### Approaches
1. **Client-side Read Persistence + Dynamic DB Queries**
   - Pros: Database doesn't need schema migrations; notifications are computed dynamically on-demand; read state is stored in the browser's localStorage. Very lightweight and quick to implement.
   - Cons: Read states are not synced across different browsers/devices for the same admin user. (Acceptable tradeoff since there is typically one admin session/device per manager).
   - Effort: Medium

### Recommendation
Use Approach 1. It keeps database performance clean and avoids schema migrations, while providing the expected real-time notifications functionality.

### Risks
- **Cascade Deletion**: When an order is deleted, its order items must be cascade-deleted. This is already handled by Prisma's `onDelete: Cascade` constraint in the schema.
- **Stock Reconciliation**: Restoring stock for non-cancelled orders on deletion is necessary to prevent stock leakage. We will handle this explicitly in the `DELETE` API route transaction.

### Ready for Proposal
Yes.
