
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('--- BRANDS ---');
  const brands = await prisma.brand.findMany();
  console.table(brands);

  console.log('\n--- PRODUCTS (Last 10) ---');
  const products = await prisma.product.findMany({
    take: 10,
    orderBy: { updatedAt: 'desc' },
    include: {
      brand: true,
      category: true,
    },
  });
  
  console.log(JSON.stringify(products.map(p => ({
    id: p.id,
    name: p.name,
    brand: p.brand?.name,
    category: p.category?.name,
    updatedAt: p.updatedAt
  })), null, 2));
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
