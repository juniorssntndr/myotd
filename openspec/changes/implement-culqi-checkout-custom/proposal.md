# Proposal: Implement Culqi Checkout Custom

## Intent
Replace the legacy hosted payment gateway redirect with Culqi Checkout Custom (v4 modal) to keep the user on our site and offer Yape, Plin, and Card payments in a unified modal overlay.

## Scope

### In Scope
- Integrate Culqi Checkout v4 JS script (`https://checkout.culqi.com/js/v4`) in client-side Next.js.
- Implement checkout modal launcher for CARD and WALLET payment methods.
- Create Route Handler `/api/checkout/charge` to handle card token charge submissions.
- Update `.env` to expose `NEXT_PUBLIC_CULQI_PUBLIC_KEY` and define real secret keys.
- Webhook updates to mark orders as paid/confirmed.

### Out of Scope
- Re-architecting `TRANSFER` and `CASH_ON_DELIVERY` flows (remain direct DB entries).
- Custom modal CSS styling overrides beyond Culqi's standard parameters.

## Capabilities

### New Capabilities
- `culqi-checkout-custom`: Unified client-side modal checkout processing Cards and Yape.

### Modified Capabilities
- None

## Approach
Create the order on the backend to obtain a Culqi `order_id`, initialize the `CulqiCheckout` modal on the client with the order ID, capture the card token in the frontend callback, and post it to a new backend `/api/checkout/charge` route. For Yape/others, close the modal on success and let the backend webhook update the status.

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `.env` | Modified | Expose public key and add secret credentials |
| `src/app/(shop)/checkout/page.tsx` | Modified | Add JS script, modal initialization, and custom event handlers |
| `src/app/api/checkout/route.ts` | Modified | Return Culqi order ID to frontend |
| `src/app/api/checkout/charge/route.ts` | New | Create Route Handler to process card charge tokens |
| `src/lib/culqi.ts` | Modified | Add support for charging tokens and standard API calls |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Production key abuse | Medium | Keep `sk_live_...` secure on the server. Do not test real card payments using live keys in dev |
| SSR/Window issues | Low | Wrap Culqi SDK calls inside client-side hooks (`useEffect`, `'use client'`) |

## Rollback Plan
Revert changes to `src/app/(shop)/checkout/page.tsx` and `src/app/api/checkout/route.ts` to restore the redirection to the hosted checkout page, and revert environment variables.

## Dependencies
- Culqi Public and Private keys (`pk_live_zBBKkaMGHua64MTr`, `sk_live_QCnvicsiD0mk06MD`).

## Success Criteria
- [ ] Culqi modal opens successfully on CARD/WALLET select.
- [ ] Card payment tokenizes and completes via `/api/checkout/charge`.
- [ ] Yape payment completes and webhook confirms the transaction.
