# Proposal: Admin Notifications and Order Deletion

## Intent
Implement dynamic admin notifications (orders, users, stock warnings) and order deletion capability with confirmation.

## Scope

### In Scope
- Route `/api/admin/notifications` compiling the latest orders, users, and low stock items.
- Dynamic notification rendering and read-tracking in `AdminHeader` via Zustand.
- HTTP `DELETE` endpoint `/api/orders/[id]` that cascade-deletes orders and restores stock if the order wasn't cancelled.
- Order deletion UI buttons in both list and detail pages with `AlertDialog` double-check.

### Out of Scope
- Server-Sent Events (SSE) or WebSockets for instant push notifications (deferred).
- Database notification logging table.

## Capabilities

### New Capabilities
- `admin-notifications`: Live list of important store alerts (new registrations, new sales, low stock).
- `order-deletion`: Delete customer orders from the dashboard after a double-check confirmation, restoring inventory if appropriate.

## Approach
- Add `DELETE` request handler to `/api/orders/[id]/route.ts`.
- Expand `useAdminStore` and `useNotificationStore` with necessary actions.
- Use `AlertDialog` in the admin order list and detail screens to prompt confirmation.

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `src/app/api/admin/notifications/route.ts` | New | Route handler to compile notifications. |
| `src/stores/notification-store.ts` | Modified | Add `fetchNotifications`, `readIds` list. |
| `src/components/admin/AdminHeader.tsx` | Modified | Trigger `fetchNotifications` on mount. |
| `src/app/api/orders/[id]/route.ts` | Modified | Add `DELETE` handler. |
| `src/stores/admin-store.ts` | Modified | Add `deleteOrder` action. |
| `src/app/(admin-panel)/admin/orders/page.tsx` | Modified | Add delete action and alert dialog. |
| `src/app/(admin-panel)/admin/orders/[id]/page.tsx` | Modified | Add delete button and alert dialog. |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Inconsistent stock values | Low | Revert stock of order items inside the deletion transaction if status !== "CANCELLED". |

## Rollback Plan
Revert git changes.

## Success Criteria
- [ ] Notifications show real sales, users, and low stock warnings.
- [ ] Clicking "Marcar todas como leídas" clears notifications.
- [ ] Deleting an order from the list or detail screen requires double confirmation.
- [ ] Confirmed deletion deletes order, updates list, and restores stock if status was active.
