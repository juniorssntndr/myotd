## Exploration: implement-culqi-checkout-custom

### Current State
The project has a basic checkout system that integrates with Culqi:
1. The backend (`src/app/api/checkout/route.ts` and `src/lib/culqi.ts`) creates a Culqi order and returns a redirect URL pointing to `https://checkout.culqi.com`.
2. The frontend (`src/app/(shop)/checkout/page.tsx`) redirects the user to that URL.
3. The configuration (`.env`) currently contains dummy placeholder keys (`pk_test_...` / `sk_test_...`).
4. There is a webhook handler (`src/app/api/webhook/culqi/route.ts`) that listens to events like `payment.confirmed` and updates the database order status and variant inventory.

This redirect flow moves the user away from our application. Culqi's Checkout Custom v4 allows opening the checkout directly within a modal on our site, which provides a premium, unified user experience.

### Affected Areas
- `d:\Archivos personales\Codigo\ecommerce\.env` — Needs the real Culqi credentials (`pk_live_...` and `sk_live_...`) from the screenshot, and exposing the public key as `NEXT_PUBLIC_CULQI_PUBLIC_KEY` to the client.
- `d:\Archivos personales\Codigo\ecommerce\src\app\(shop)\checkout\page.tsx` — Needs script loading for `https://checkout.culqi.com/js/v4`, initializing `CulqiCheckout` on the window object, and displaying the modal inline instead of redirecting the page.
- `d:\Archivos personales\Codigo\ecommerce\src\app\api\checkout\route.ts` — Needs to return the raw Culqi `order_id` along with the order number and DB ID.
- `d:\Archivos personales\Codigo\ecommerce\src\app\api\checkout\charge\route.ts` — [NEW] A new route handler to accept the generated card token and create a Culqi charge (`POST /v2/charges`) on the server.
- `d:\Archivos personales\Codigo\ecommerce\src\lib\culqi.ts` — Needs functions to handle card charging by token and order, and error handling alignment.

### Approaches

1. **Approach 1: Custom Checkout Modal (Integration with Culqi Checkout v4 Modal)**
   - **Description**: Load Culqi's v4 JS library on the frontend. When the checkout is submitted with CARD/WALLET:
     - The backend generates a Culqi order and returns the `order_id` (e.g. `ord_live_...`).
     - The frontend instantiates `new CulqiCheckout(...)` using that `order_id` and opens the modal using `Culqi.open()`.
     - For Cards: The `onToken` / `culqi` callback is triggered with the token, which is sent to `/api/checkout/charge` to create the final charge.
     - For Wallet (Yape): Culqi handles it internally in the modal, and the webhook confirms the payment.
   - Pros: A premium checkout experience completely integrated into the site (modal overlay). Fully supports Yape, Plin, and Cards under a single modal.
   - Cons: Requires loading external JavaScript and managing modal life cycles.
   - Effort: Medium

2. **Approach 2: Full Redirect to Hosted Checkout (Current State)**
   - **Description**: Maintain the current implementation, which redirects the user to the Culqi checkout page.
   - Pros: Simple to maintain, already partially implemented.
   - Cons: User leaves the site, degrading UX. Does not match the Culqi Checkout Custom documentation provided by the user.
   - Effort: Low

### Recommendation
**Approach 1** is highly recommended because it directly aligns with the Culqi Checkout Custom v4 documentation shown in the user's screenshot, keeps the user on the site, and delivers a professional fashion e-commerce experience.

### Risks
- **Testing in Dev vs Live**: The user provided Live keys. We should ensure we don't accidentally perform real charges during basic validation or provide clear warning.
- **Next.js SSR/Hydration**: The Culqi script must be loaded safely on the client side (`'use client'`) to avoid node/window definition issues during server side rendering.
- **Webhook confirmation latency**: Yape payments rely on webhooks. The frontend must handle the delay or redirect cleanly, and webhooks must be verified with the real webhook secret.

### Ready for Proposal
Yes. The next step is to create the formal proposal (`proposal.md`).
