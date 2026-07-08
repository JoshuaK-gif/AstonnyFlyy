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
    console.log('Syncing database schema: creating all tables...');
    
    // Product Table
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "Product" (
        "id" TEXT PRIMARY KEY,
        "name" TEXT NOT NULL,
        "category" TEXT NOT NULL,
        "brand" TEXT NOT NULL,
        "price" DOUBLE PRECISION NOT NULL,
        "discountPrice" DOUBLE PRECISION,
        "description" TEXT NOT NULL,
        "images" TEXT[],
        "sizes" TEXT[],
        "colors" TEXT[],
        "sku" TEXT UNIQUE NOT NULL,
        "tags" TEXT[],
        "collections" TEXT[] DEFAULT '{}',
        "stockStatus" TEXT NOT NULL,
        "stockQuantity" INTEGER DEFAULT 0,
        "featured" BOOLEAN DEFAULT false,
        "newArrival" BOOLEAN DEFAULT false,
        "bestseller" BOOLEAN DEFAULT false,
        "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Collection Table
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "Collection" (
        "id" TEXT PRIMARY KEY,
        "title" TEXT NOT NULL,
        "tag" TEXT NOT NULL,
        "image" TEXT NOT NULL,
        "href" TEXT NOT NULL,
        "type" TEXT DEFAULT 'category',
        "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Order Table
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "Order" (
        "id" TEXT PRIMARY KEY,
        "orderNumber" TEXT UNIQUE NOT NULL,
        "customerName" TEXT NOT NULL,
        "customerEmail" TEXT NOT NULL,
        "customerPhone" TEXT,
        "shippingAddress" TEXT NOT NULL,
        "totalAmount" DOUBLE PRECISION NOT NULL,
        "status" TEXT DEFAULT 'Pending',
        "items" JSONB NOT NULL,
        "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // ProductProperty Table
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "ProductProperty" (
        "id" TEXT PRIMARY KEY,
        "type" TEXT NOT NULL,
        "name" TEXT NOT NULL,
        "value" TEXT NOT NULL
      );
    `);

    // ImpactStat Table
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "ImpactStat" (
        "id" TEXT PRIMARY KEY,
        "value" INTEGER NOT NULL,
        "suffix" TEXT NOT NULL,
        "label" TEXT NOT NULL
      );
    `);

    // Message Table
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "Message" (
        "id" TEXT PRIMARY KEY,
        "name" TEXT NOT NULL,
        "email" TEXT NOT NULL,
        "subject" TEXT,
        "message" TEXT NOT NULL,
        "status" TEXT DEFAULT 'Unread',
        "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Subscriber Table
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "Subscriber" (
        "id" TEXT PRIMARY KEY,
        "email" TEXT UNIQUE NOT NULL,
        "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // LookbookItem Table
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "LookbookItem" (
        "id" TEXT PRIMARY KEY,
        "image" TEXT NOT NULL,
        "title" TEXT NOT NULL,
        "size" TEXT DEFAULT 'base',
        "order" INTEGER DEFAULT 0,
        "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // CommunityImage Table
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "CommunityImage" (
        "id" TEXT PRIMARY KEY,
        "image" TEXT NOT NULL,
        "alt" TEXT,
        "order" INTEGER DEFAULT 0,
        "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Testimonial Table
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "Testimonial" (
        "id" TEXT PRIMARY KEY,
        "name" TEXT NOT NULL,
        "text" TEXT NOT NULL,
        "order" INTEGER DEFAULT 0,
        "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // SiteSettings Table
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "SiteSettings" (
        "id" TEXT PRIMARY KEY,
        "heroBgType" TEXT NOT NULL DEFAULT 'image',
        "heroBgColor" TEXT NOT NULL DEFAULT '#0f172a',
        "heroBgImage" TEXT NOT NULL DEFAULT 'https://media.base44.com/images/public/6a2c25958136d9426eca8288/eeecd1355_generated_8fbbcd65.png',
        "collectionsBgType" TEXT NOT NULL DEFAULT 'color',
        "collectionsBgColor" TEXT NOT NULL DEFAULT '#ffffff',
        "collectionsBgImage" TEXT,
        "featuredBgType" TEXT NOT NULL DEFAULT 'color',
        "featuredBgColor" TEXT NOT NULL DEFAULT '#ffffff',
        "featuredBgImage" TEXT,
        "brandStoryBgType" TEXT NOT NULL DEFAULT 'color',
        "brandStoryBgColor" TEXT NOT NULL DEFAULT '#ffffff',
        "brandStoryBgImage" TEXT,
        "lookbookBgType" TEXT NOT NULL DEFAULT 'color',
        "lookbookBgColor" TEXT NOT NULL DEFAULT '#ffffff',
        "lookbookBgImage" TEXT,
        "impactNumbersBgType" TEXT NOT NULL DEFAULT 'color',
        "impactNumbersBgColor" TEXT NOT NULL DEFAULT '#0f172a',
        "impactNumbersBgImage" TEXT,
        "communityBgType" TEXT NOT NULL DEFAULT 'color',
        "communityBgColor" TEXT NOT NULL DEFAULT '#ffffff',
        "communityBgImage" TEXT,
        "newsletterBgType" TEXT NOT NULL DEFAULT 'color',
        "newsletterBgColor" TEXT NOT NULL DEFAULT '#f8fafc',
        "newsletterBgImage" TEXT,
        "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    console.log('Database synced successfully!');
  } catch (error) {
    console.error('Failed to sync database:', error);
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

main();
