# Tasks: Admin Notifications and Order Deletion

## Phase 1: API Route & Deletion Backend
- [ ] 1.1 Create `/api/admin/notifications/route.ts` implementing `requireAdmin()` and querying DB.
- [ ] 1.2 Modify `/api/orders/[id]/route.ts` to implement the `DELETE` method with stock reversion.

## Phase 2: State Stores Integration
- [ ] 2.1 Update `src/stores/notification-store.ts` to support dynamic fetches and `readIds` persistence.
- [ ] 2.2 Update `src/stores/admin-store.ts` to implement the `deleteOrder` store action.

## Phase 3: UI Implementation
- [ ] 3.1 Modify `src/components/admin/AdminHeader.tsx` to fetch notifications on component load.
- [ ] 3.2 Modify `/admin/orders/page.tsx` to include order deletion dropdown action and `AlertDialog` prompt.
- [ ] 3.3 Modify `/admin/orders/[id]/page.tsx` to include "Eliminar Pedido" button and `AlertDialog` prompt.

## Phase 4: Verification
- [ ] 4.1 Verify notifications update and clear correctly.
- [ ] 4.2 Verify double-check order deletion cascades correctly in the database and reconciles variant inventory stock.
