# Tasks: Implement Culqi Checkout Custom

## Phase 1: Foundation & Config

- [x] 1.1 Update `.env` and `.env.example` with `NEXT_PUBLIC_CULQI_PUBLIC_KEY="pk_live_zBBKkaMGHua64MTr"`, `CULQI_PUBLIC_KEY="pk_live_zBBKkaMGHua64MTr"`, and `CULQI_SECRET_KEY="sk_live_QCnvicsiD0mk06MD"`.
- [x] 1.2 In `src/lib/culqi.ts`, export function `createCulqiCharge(params: { amount: number, email: string, sourceId: string, orderNumber: string })` to invoke POST `/charges` using `sk_live_QCnvicsiD0mk06MD`.

## Phase 2: Backend Route Handlers

- [x] 2.1 In `src/app/api/checkout/route.ts`, include `culqiOrderId` (from `culqiResult.payment.id`) in the JSON response payload.
- [x] 2.2 Create Route Handler `src/app/api/checkout/charge/route.ts` implementing:
  - Validate payload (`token`, `orderNumber`, `email`).
  - Query DB `order` by `orderNumber` to verify status `PENDING` and fetch total amount.
  - Call `createCulqiCharge(...)` with order total, email, and card token.
  - On successful charge, run DB transaction: update order status to `PROCESSING`, set `culqiPaymentId`, and decrement stock for all order variants.
  - Return `{ success: true, orderNumber }` on success, or appropriate error JSON.

## Phase 3: Frontend Integration

- [x] 3.1 In `src/app/(shop)/checkout/page.tsx`, import `next/script` and render `<Script src="https://checkout.culqi.com/js/v4" strategy="lazyOnload" />`.
- [x] 3.2 In `src/app/(shop)/checkout/page.tsx`:
  - Define custom type declarations for `window.CulqiCheckout` and `window.culqi` callback to satisfy compiler.
  - When payment method is `CARD` or `WALLET`:
    - After calling `/api/checkout`, read `culqiOrderId`.
    - Instantiate `new window.CulqiCheckout(...)` passing settings (currency, amount, order ID) and public key.
    - Define global `window.culqi = function() { ... }`:
      - If `Culqi.token` is returned: post it to `/api/checkout/charge` to finalize, clear cart, and redirect to success.
      - If `Culqi.order` is completed (Yape): clear cart and redirect to success immediately.
      - If `Culqi.error` is encountered: show error alert in UX.
    - Call `Culqi.open()` to display the payment modal inline.

## Phase 4: Verification & Polish

- [x] 4.1 Verify linting and type-checking are clean by running `npm run lint` and `npx tsc --noEmit`.
- [ ] 4.2 Validate manual checkout flow using test inputs.
