
const { Client } = require('pg');
require('dotenv').config();

async function main() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    await client.connect();
    
    console.log('\n--- BRANDS ---');
    const brands = await client.query('SELECT * FROM "brands"');
    console.table(brands.rows);

    console.log('\n--- PRODUCTS WITH "zapatilla" ---');
    const products = await client.query('SELECT p.id, p.name, p."brandId", b.name as brand_name FROM "products" p LEFT JOIN "brands" b ON p."brandId" = b.id WHERE p.name ILIKE \'%zapatilla%\'');
    console.table(products.rows);

    console.log('\n--- LAST 5 PRODUCTS ---');
    const lastProducts = await client.query('SELECT p.id, p.name, p."brandId", b.name as brand_name FROM "products" p LEFT JOIN "brands" b ON p."brandId" = b.id ORDER BY p."updatedAt" DESC LIMIT 5');
    console.table(lastProducts.rows);

  } catch (err) {
    console.error(err);
  } finally {
    await client.end();
  }
}

main();
