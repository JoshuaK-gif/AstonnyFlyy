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
    const props = await prisma.productProperty.findMany();
    console.log('--- PRODUCT PROPERTIES ---');
    console.log(JSON.stringify(props, null, 2));

    const collections = await prisma.collection.findMany();
    console.log('--- COLLECTIONS ---');
    console.log(JSON.stringify(collections, null, 2));
  } catch (err) {
    console.error(err);
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

main();
