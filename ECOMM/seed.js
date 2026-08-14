import pg from 'pg';
import dotenv from 'dotenv';
dotenv.config();

const { Client } = pg;
const client = new Client({
  host: process.env.PG_MASTER_HOST || '127.0.0.1',
  port: process.env.PG_MASTER_PORT || 5432,
  database: process.env.PG_MASTER_DATABASE || 'ecommerce',
  user: process.env.PG_MASTER_USERNAME || 'root',
  password: process.env.PG_MASTER_PASSWORD || 'root123',
});

async function seed() {
  await client.connect();
  console.log('Connected to DB');

  // 1. Insert a dummy category to satisfy the not-null constraint
  const catRes = await client.query(`
    INSERT INTO master.categories (name, description, status)
    VALUES ($1, $2, $3)
    ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name
    RETURNING id
  `, ['Electronics', 'All electronic products', 'ACTIVE']).catch(async () => {
    // Fallback if ON CONFLICT fails due to no unique constraint
    const exist = await client.query(`SELECT id FROM master.categories LIMIT 1`);
    if (exist.rowCount > 0) return exist;
    return await client.query(`INSERT INTO master.categories (name, description, status) VALUES ('Electronics', 'Desc', 'ACTIVE') RETURNING id`);
  });

  const categoryId = catRes.rows[0].id;
  console.log('Using category_id:', categoryId);

  const products = [
    {
      sku: 'PROD-001',
      name: 'Premium Wireless Headphones',
      description: 'High-quality wireless headphones with active noise cancellation and 30-hour battery life.',
      price: 199.99,
      stock_quantity: 50,
      status: 'ACTIVE',
      category_id: categoryId
    },
    {
      sku: 'PROD-002',
      name: 'Mechanical Keyboard',
      description: 'Tenkeyless mechanical keyboard with RGB backlighting and tactile switches.',
      price: 129.50,
      stock_quantity: 200,
      status: 'ACTIVE',
      category_id: categoryId
    },
    {
      sku: 'PROD-003',
      name: 'Ergonomic Mouse',
      description: 'Wireless ergonomic mouse designed to reduce wrist strain during long hours of use.',
      price: 59.99,
      stock_quantity: 120,
      status: 'ACTIVE',
      category_id: categoryId
    }
  ];

  for (const p of products) {
    await client.query(`
      INSERT INTO master.products (sku, category_id, name, description, price, stock_quantity, status)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      ON CONFLICT DO NOTHING
    `, [p.sku, p.category_id, p.name, p.description, p.price, p.stock_quantity, p.status]);
  }

  console.log('Inserted products!');
  await client.end();
}

seed().catch(console.error);
