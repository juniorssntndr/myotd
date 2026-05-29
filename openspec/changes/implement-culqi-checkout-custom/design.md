# Design: Implement Culqi Checkout Custom

## Technical Approach
We will replace the hosted checkout redirect with the client-side `CulqiCheckout` modal. The frontend loads the JS library, initiates it using the Culqi order ID returned by `/api/checkout`, and opens the modal. When the payment completes:
1. For card payments, the frontend sends the token to `/api/checkout/charge` to execute the charge.
2. For Yape payments, the modal manages the payment directly, and the webhook updates the status. The frontend redirects directly to the success page.

## Architecture Decisions

### Decision: Culqi Script Loading
- **Choice**: Load `https://checkout.culqi.com/js/v4` via `next/script` in `src/app/(shop)/checkout/page.tsx` with `strategy="lazyOnload"`.
- **Tradeoff**: Script is only loaded on the checkout page, minimizing initial bundle size. Requires a short delay before checkout is interactive, which matches the checkout step flow (user is on Step 3 before paying).

### Decision: API Charge Route
- **Choice**: Create `/api/checkout/charge/route.ts` to charge card tokens on the backend.
- **Tradeoff**: Adheres to Project Rule #2 (no Server Actions). Validates order amounts against the DB, preventing frontend price tampering.

## Data Flow

```
[Frontend: checkout/page] ──(POST /api/checkout)──→ [Backend: API checkout]
          │                                                  │
   (Open Culqi Modal)                                  (Create Order on Culqi)
          │                                                  │
          ▼                                                  ▼
   [Culqi Modal Popup] ──(Token/Order)───────────────→ [Culqi Servers]
          │                                                  │
          ▼                                                  │
   (Callback: culqi())                                   (Webhook)
          │                                                  │
          ▼                                                  ▼
[POST /api/checkout/charge] ──→ [Backend: API charge] ──→ [Database Order Update]
```

## File Changes

| File | Action | Description |
|------|--------|-------------|
| `.env` | Modify | Expose `NEXT_PUBLIC_CULQI_PUBLIC_KEY` and define keys. |
| `.env.example` | Modify | Update placeholder keys. |
| `src/app/api/checkout/route.ts` | Modify | Return `culqiOrderId` in payload response. |
| `src/lib/culqi.ts` | Modify | Add `createCulqiCharge` API helper. |
| `src/app/api/checkout/charge/route.ts` | Create | Route Handler to process card charge tokens. |
| `src/app/(shop)/checkout/page.tsx` | Modify | Load SDK script, initialize `CulqiCheckout`, handle callbacks, and open modal. |

## Interfaces / Contracts

```typescript
// Payload sent to POST /api/checkout/charge
export interface ChargeBody {
  token: string
  orderNumber: string
  email: string
}
```

## Testing Strategy

| Layer | What to Test | Approach |
|-------|-------------|----------|
| Integration (Route) | `/api/checkout/charge` | Post mock token payloads and verify DB status updates and mock Culqi calls. |
| Manual | Checkout Page Modal | Verify the Culqi Modal opens when clicking Pay and completes test card charges. |

## Migration / Rollout
No database migration required. Keys must be populated in the production environment.
