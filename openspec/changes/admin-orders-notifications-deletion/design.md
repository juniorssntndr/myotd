# Design: Admin Notifications and Order Deletion

## Technical Approach
We will build a dynamic GET route `/api/admin/notifications` compiling notifications. The state will be synced in Zustand with client-side read ID tracking. A DELETE endpoint will be implemented at `/api/orders/[id]` with stock restoration logic. Double confirmation dialogs (`AlertDialog` from Radix) will guard the deletion UI.

## Architecture Decisions

### Decision: Client-side Dismissal Tracking
**Choice**: Store dismissed notification IDs in the browser's `localStorage` via Zustand `persist` middleware.
**Alternatives considered**: Save read states in database tables.
**Rationale**: Avoids schema modifications and database reads/writes for ephemeral read states, keeping code simple and database overhead minimal.

### Decision: stock Reversion on Delete
**Choice**: Perform stock reversion inside a database transaction alongside the DELETE query.
**Alternatives considered**: Perform reversion before the DELETE in separate calls.
**Rationale**: Guarantees consistency; if the deletion fails, stock is not reverted, preventing stock leaks.

## Data Flow
```
[AdminHeader] ──(fetchNotifications)──→ [GET /api/admin/notifications] ──(Query DB)──→ [Users, Orders, Low Stock]
[Orders UI] ──(deleteOrder)──→ [DELETE /api/orders/[id]] ──(Database Tx)──→ [Restore Stock + Cascade Delete Order]
```

## File Changes

| File | Action | Description |
|------|--------|-------------|
| `src/app/api/admin/notifications/route.ts` | Create | Query orders, users, and low stock variants, return formatted notifications. |
| `src/stores/notification-store.ts` | Modify | Update state schema to include `readIds` list and `fetchNotifications` action. |
| `src/components/admin/AdminHeader.tsx` | Modify | Call `fetchNotifications` on mount. |
| `src/app/api/orders/[id]/route.ts` | Modify | Implement the `DELETE` request handler. |
| `src/stores/admin-store.ts` | Modify | Add `deleteOrder` async action calling `DELETE /api/orders/[id]`. |
| `src/app/(admin-panel)/admin/orders/page.tsx` | Modify | Connect dropdown action, trigger alert dialog confirmation on click. |
| `src/app/(admin-panel)/admin/orders/[id]/page.tsx` | Modify | Add delete button and double-check trigger, redirect to list on success. |

## Interfaces / Contracts
```typescript
interface Notification {
  id: string
  title: string
  time: string
  read?: boolean
}
```

## Testing Strategy
- Manual verify notification bell shows correct values based on DB users, orders, and low stock.
- Click mark all as read and verify they disappear.
- Manual test delete button: click delete, verify dialog opens, cancel → nothing happens. Confirm → order deleted, list refreshes, product variant stock goes up.

## Migration / Rollout
No database migration required.
