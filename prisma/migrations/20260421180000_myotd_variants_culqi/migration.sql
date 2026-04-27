-- Align orders.paymentMethod with schema (enum -> text)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'orders'
      AND column_name = 'paymentMethod'
      AND udt_name = 'PaymentMethod'
  ) THEN
    ALTER TABLE "orders"
      ALTER COLUMN "paymentMethod" TYPE TEXT USING "paymentMethod"::TEXT;
  END IF;
END $$;

-- Add Culqi payment id for external reconciliation
ALTER TABLE "orders"
  ADD COLUMN IF NOT EXISTS "culqiPaymentId" TEXT;

-- Product variants table (size + color + stock)
CREATE TABLE IF NOT EXISTS "product_variants" (
  "id" TEXT NOT NULL,
  "sku" TEXT NOT NULL,
  "size" TEXT NOT NULL,
  "color" TEXT NOT NULL,
  "stock" INTEGER NOT NULL DEFAULT 0,
  "productId" TEXT NOT NULL,
  CONSTRAINT "product_variants_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "product_variants_sku_key" ON "product_variants"("sku");
CREATE UNIQUE INDEX IF NOT EXISTS "product_variants_productId_size_color_key" ON "product_variants"("productId", "size", "color");
CREATE INDEX IF NOT EXISTS "product_variants_productId_idx" ON "product_variants"("productId");

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'product_variants_productId_fkey'
  ) THEN
    ALTER TABLE "product_variants"
      ADD CONSTRAINT "product_variants_productId_fkey"
      FOREIGN KEY ("productId") REFERENCES "products"("id")
      ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

-- Link order items to a specific variant
ALTER TABLE "order_items"
  ADD COLUMN IF NOT EXISTS "variantId" TEXT;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'order_items_variantId_fkey'
  ) THEN
    ALTER TABLE "order_items"
      ADD CONSTRAINT "order_items_variantId_fkey"
      FOREIGN KEY ("variantId") REFERENCES "product_variants"("id")
      ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;
