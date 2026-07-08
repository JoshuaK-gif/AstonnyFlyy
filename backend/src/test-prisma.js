import pkg from '@prisma/client';
const { PrismaClient } = pkg;
import dotenv from 'dotenv';
dotenv.config();

const prisma = new PrismaClient({
  accelerateUrl: process.env.DATABASE_URL
});

async function main() {
  try {
    const products = await prisma.product.findMany();
    console.log('Successfully fetched products:', products.length);
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await prisma.$disconnect();
  }
}

main();
