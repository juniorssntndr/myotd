
const { Client } = require('pg');
require('dotenv').config();

async function main() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    await client.connect();
    
    console.log('\n--- ALL BRANDS ---');
    const brands = await client.query('SELECT * FROM "brands" ORDER BY name ASC');
    console.table(brands.rows);

    console.log('\n--- ALL CATEGORIES ---');
    const categories = await client.query('SELECT * FROM "categories" ORDER BY name ASC');
    console.table(categories.rows);

  } catch (err) {
    console.error(err);
  } finally {
    await client.end();
  }
}

main();
