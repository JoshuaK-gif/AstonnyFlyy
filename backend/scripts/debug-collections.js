import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import dotenv from 'dotenv';
dotenv.config();

const { Pool } = pg;
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({ adapter });

async function main() {
  try {
    const collections = await prisma.collection.findMany();
    console.log('Available Collections:');
    collections.forEach(c => console.log(`- ${c.title} (ID: ${c.id}, Href: ${c.href})`));

    const products = await prisma.product.findMany({
      select: { name: true, collections: true }
    });
    console.log('\nProduct Assignments:');
    products.forEach(p => console.log(`- ${p.name}: [${p.collections.join(', ')}]`));
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

main();
