import "dotenv/config";
import { prisma } from "../src/lib/prisma";

async function checkData() {
  console.log("--- BRANDS ---");
  const brands = await prisma.brand.findMany();
  console.log(JSON.stringify(brands, null, 2));

  console.log("\n--- PRODUCTS (First 5) ---");
  const products = await prisma.product.findMany({
    take: 5,
    include: {
      brand: true,
      category: true,
    }
  });
  console.log(JSON.stringify(products.map(p => ({
    id: p.id,
    name: p.name,
    brandId: p.brandId,
    brandName: p.brand.name,
    categoryId: p.categoryId,
    categoryName: p.category.name
  })), null, 2));
}

checkData()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
