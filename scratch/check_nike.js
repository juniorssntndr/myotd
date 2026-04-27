
const { Client } = require('pg');
require('dotenv').config();

async function main() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    await client.connect();
    
    console.log('\n--- SEARCHING FOR "Nike" BRAND ---');
    const nike = await client.query('SELECT * FROM "brands" WHERE name ILIKE \'%Nike%\'');
    console.table(nike.rows);

    if (nike.rows.length > 0) {
      const nikeId = nike.rows[0].id;
      console.log(`\n--- PRODUCTS WITH Nike (ID: ${nikeId}) ---`);
      const products = await client.query('SELECT id, name, "brandId" FROM "products" WHERE "brandId" = $1', [nikeId]);
      console.table(products.rows);
    } else {
      console.log('\nBrand "Nike" not found in the database.');
    }

  } catch (err) {
    console.error(err);
  } finally {
    await client.end();
  }
}

main();
