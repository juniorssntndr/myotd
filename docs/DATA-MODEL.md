# DATA MODEL: Myotd (Variant-First)

## Overview
Myotd uses variant-level inventory. Products are catalog entities, while stock and SKU are tracked in `ProductVariant` by size/color combination.

## Key Entities

### User
- `id`, `email`, `password`, `name`, `role`, `status`.
- Relations: `addresses`, `orders`.

### Category
- Fashion grouping (`polos`, `hoodies`, `joggers`, `zapatillas`, `accesorios`).

### Brand
- Brand catalog for recognized and accessible labels.

### Product
- Base commercial entity:
  - `name`, `slug`, `description`
  - `price`, `comparePrice`
  - `images[]`, `specs`
  - `isNew`, `isFeatured`, `isActive`
- Relations:
  - many `ProductVariant`
  - many `OrderItem`

### ProductVariant
- Inventory source of truth:
  - `id`, `sku`, `size`, `color`, `stock`
  - `productId`
- Constraints:
  - unique `sku`
  - unique combination `(productId, size, color)`

### Address
- Shipping target for orders:
  - `label`, `name`, `phone`, `address`, `city`, `state`, `zipCode`, `isDefault`.

### Order
- Commercial transaction snapshot:
  - `orderNumber`, `status`
  - `subtotal`, `shipping`, `total`
  - `paymentMethod` (stored as string contract)
  - `culqiPaymentId` (gateway reference)
  - `notes`
  - relations: `user`, `address`, `items`

### OrderItem
- Immutable purchase line snapshot:
  - `productId`, `variantId`
  - `name`, `price`, `quantity`, `total`
- Runtime/API expansion includes `size`, `color`, `sku`, brand and image.

## Order Status Lifecycle
`PENDING -> CONFIRMED -> PROCESSING -> SHIPPED -> DELIVERED`

Alternative terminal state:
`CANCELLED`

## Inventory Rules
- Stock decrement happens on payment confirmation.
- Stock restore happens on refund/cancel flow.
- Variant stock is never inferred from product-level fields.

## Checkout Contract
`CheckoutBody` requires:
- `items[] { productId, variantId, name, brand, size, color, price, quantity, image }`
- `shippingAddress`
- `paymentMethod`
- `notes?`

`POST /api/checkout` success response:
- `{ checkoutUrl, orderId, orderNumber }`

## Migration Strategy
- Additive migration plus backfill.
- No destructive reset.
- Backfill creates minimum valid variants for legacy products and links legacy order items when needed.
