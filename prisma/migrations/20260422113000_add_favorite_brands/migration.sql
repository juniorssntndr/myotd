-- Create favorite brand join table
CREATE TABLE "favorite_brands" (
  "userId" TEXT NOT NULL,
  "brandId" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "favorite_brands_pkey" PRIMARY KEY ("userId", "brandId"),
  CONSTRAINT "favorite_brands_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "favorite_brands_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES "brands"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX "favorite_brands_brandId_idx" ON "favorite_brands"("brandId");
